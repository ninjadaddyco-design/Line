import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, retry = false } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (order.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Order not paid' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent duplicate CJ submission (idempotency)
    if (order.cj_order_id && !retry) {
      console.log('CJ order already exists:', order.cj_order_id);
      return new Response(JSON.stringify({ success: true, cj_order_id: order.cj_order_id, idempotent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read CJ credentials from admin_settings
    const { data: settingsRows } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['cj_api_key', 'cj_api_secret']);

    const settings: Record<string, string> = {};
    settingsRows?.forEach((row: { key: string; value: string }) => { settings[row.key] = row.value; });

    const cjApiKey = settings['cj_api_key'] || Deno.env.get('CJ_API_KEY') || '';
    const cjApiSecret = settings['cj_api_secret'] || Deno.env.get('CJ_API_SECRET') || '';

    if (!cjApiKey) {
      console.error('CJ API key not configured');
      await supabaseAdmin.from('orders').update({
        fulfillment_status: 'fulfillment_error',
        fulfillment_error: 'CJ API key not configured. Please add it in Admin > Settings.',
        fulfillment_attempts: (order.fulfillment_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('fulfillment_records').insert({
        order_id: orderId,
        status: 'error',
        error_message: 'CJ API key not configured',
        attempt_number: (order.fulfillment_attempts || 0) + 1,
      });

      return new Response(JSON.stringify({ error: 'CJ API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get CJ access token
    let accessToken = '';
    try {
      const tokenRes = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cjApiKey, password: cjApiSecret }),
      });
      const tokenData = await tokenRes.json();
      console.log('CJ token response:', JSON.stringify(tokenData));

      if (!tokenData.result || !tokenData.data?.accessToken) {
        throw new Error(tokenData.message || 'Failed to get CJ access token');
      }
      accessToken = tokenData.data.accessToken;
    } catch (e) {
      const errMsg = `CJ auth failed: ${String(e)}`;
      await supabaseAdmin.from('orders').update({
        fulfillment_status: 'fulfillment_error',
        fulfillment_error: errMsg,
        fulfillment_attempts: (order.fulfillment_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('fulfillment_records').insert({
        order_id: orderId,
        status: 'error',
        error_message: errMsg,
        attempt_number: (order.fulfillment_attempts || 0) + 1,
      });

      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build CJ order products
    const products = order.items.map((item: {
      cj_product_id: string;
      cj_variant_id: string;
      quantity: number;
    }) => ({
      vid: item.cj_variant_id || '',
      quantity: item.quantity,
    })).filter((p: { vid: string }) => p.vid);

    if (products.length === 0) {
      const errMsg = 'No CJ variant IDs configured for order items. Set them in Admin > Products.';
      await supabaseAdmin.from('orders').update({
        fulfillment_status: 'fulfillment_error',
        fulfillment_error: errMsg,
        fulfillment_attempts: (order.fulfillment_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('fulfillment_records').insert({
        order_id: orderId, status: 'error', error_message: errMsg,
        attempt_number: (order.fulfillment_attempts || 0) + 1,
      });

      return new Response(JSON.stringify({ error: errMsg }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fulfillmentPayload = {
      orderNumber: order.order_number,
      shippingZip: order.shipping_zip,
      shippingCountryCode: order.shipping_country || 'US',
      shippingPhone: order.customer_phone || '',
      shippingCustomerName: `${order.customer_first_name} ${order.customer_last_name}`,
      shippingAddress: order.shipping_address_line1,
      shippingAddress2: order.shipping_address_line2 || '',
      shippingCity: order.shipping_city,
      shippingProvince: order.shipping_state,
      remark: `LINE° Order ${order.order_number}`,
      products,
    };

    console.log('CJ fulfillment payload:', JSON.stringify(fulfillmentPayload));

    await supabaseAdmin.from('fulfillment_records').insert({
      order_id: orderId,
      status: 'pending',
      request_data: fulfillmentPayload,
      attempt_number: (order.fulfillment_attempts || 0) + 1,
    });

    // Submit to CJ
    const cjRes = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': accessToken,
      },
      body: JSON.stringify(fulfillmentPayload),
    });

    const cjData = await cjRes.json();
    console.log('CJ create order response:', JSON.stringify(cjData));

    if (cjData.result && cjData.data?.orderId) {
      const cjOrderId = cjData.data.orderId;

      await supabaseAdmin.from('orders').update({
        cj_order_id: cjOrderId,
        fulfillment_status: 'sent_to_cj',
        fulfillment_error: null,
        fulfillment_attempts: (order.fulfillment_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('fulfillment_records').update({
        cj_order_id: cjOrderId,
        status: 'success',
        response_data: cjData,
        updated_at: new Date().toISOString(),
      }).eq('order_id', orderId).order('created_at', { ascending: false }).limit(1);

      // Send processing email
      try {
        await supabaseAdmin.functions.invoke('send-email', {
          body: { type: 'order_processing', orderId },
        });
      } catch (e) {
        console.error('Email notification failed:', e);
      }

      return new Response(JSON.stringify({ success: true, cj_order_id: cjOrderId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      const errMsg = `CJ order failed: ${cjData.message || JSON.stringify(cjData)}`;

      await supabaseAdmin.from('orders').update({
        fulfillment_status: 'fulfillment_error',
        fulfillment_error: errMsg,
        fulfillment_attempts: (order.fulfillment_attempts || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('fulfillment_records').update({
        status: 'error',
        response_data: cjData,
        error_message: errMsg,
        updated_at: new Date().toISOString(),
      }).eq('order_id', orderId).order('created_at', { ascending: false }).limit(1);

      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('cj-fulfillment error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
