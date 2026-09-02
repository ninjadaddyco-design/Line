import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, reference, provider, transactionId } = await req.json();

    if (!orderId || !reference || !provider) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Read payment keys from admin_settings
    const { data: settingsRows } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['paystack_secret_key', 'flutterwave_secret_key']);

    const settings: Record<string, string> = {};
    settingsRows?.forEach((row: { key: string; value: string }) => { settings[row.key] = row.value; });

    let verified = false;
    let transactionStatus = 'pending';

    // Check for duplicate fulfillment
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, payment_reference')
      .eq('id', orderId)
      .single();

    if (existingOrder?.payment_status === 'paid') {
      console.log('Order already paid — idempotent return');
      return new Response(JSON.stringify({ verified: true, idempotent: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (provider === 'paystack' || provider === 'paystack_applepay') {
      const paystackKey = settings['paystack_secret_key'] || Deno.env.get('PAYSTACK_SECRET_KEY') || '';
      if (!paystackKey) {
        console.error('Paystack secret key not configured');
        return new Response(JSON.stringify({ error: 'Paystack not configured' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const verifyRef = transactionId || reference;
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${verifyRef}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
      });
      const paystackData = await paystackRes.json();
      console.log('Paystack verify response:', JSON.stringify(paystackData));

      verified = paystackData.status === true && paystackData.data?.status === 'success';
      transactionStatus = verified ? 'paid' : 'failed';

    } else if (provider === 'flutterwave') {
      const fwKey = settings['flutterwave_secret_key'] || Deno.env.get('FLUTTERWAVE_SECRET_KEY') || '';
      if (!fwKey) {
        return new Response(JSON.stringify({ error: 'Flutterwave not configured' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${fwKey}` },
      });
      const fwData = await fwRes.json();
      console.log('Flutterwave verify response:', JSON.stringify(fwData));

      verified = fwData.status === 'success' && fwData.data?.status === 'successful';
      transactionStatus = verified ? 'paid' : 'failed';
    }

    // Update order payment status
    if (verified) {
      await supabaseAdmin.from('orders').update({
        payment_status: 'paid',
        payment_provider: provider,
        payment_transaction_id: transactionId || null,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      // Update payment transaction record
      await supabaseAdmin.from('payment_transactions').update({
        status: 'paid',
        transaction_id: transactionId || null,
        updated_at: new Date().toISOString(),
      }).eq('reference', reference);

      // Upsert customer
      if (existingOrder) {
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('customer_email, customer_first_name, customer_last_name, customer_phone, total')
          .eq('id', orderId)
          .single();

        if (orderData) {
          const { data: existing } = await supabaseAdmin
            .from('customers')
            .select('id, total_orders, total_spent')
            .eq('email', orderData.customer_email)
            .single();

          if (existing) {
            await supabaseAdmin.from('customers').update({
              total_orders: (existing.total_orders || 0) + 1,
              total_spent: (Number(existing.total_spent) || 0) + Number(orderData.total),
              updated_at: new Date().toISOString(),
            }).eq('id', existing.id);
          } else {
            await supabaseAdmin.from('customers').insert({
              email: orderData.customer_email,
              first_name: orderData.customer_first_name,
              last_name: orderData.customer_last_name,
              phone: orderData.customer_phone,
              total_orders: 1,
              total_spent: Number(orderData.total),
            });
          }
        }
      }

      // Trigger fulfillment
      try {
        await supabaseAdmin.functions.invoke('cj-fulfillment', {
          body: { orderId },
        });
      } catch (e) {
        console.error('Auto-fulfillment trigger failed:', e);
        // Don't fail the payment verification — just log
      }

      // Trigger email notification
      try {
        await supabaseAdmin.functions.invoke('send-email', {
          body: { type: 'payment_confirmed', orderId },
        });
      } catch (e) {
        console.error('Email notification failed:', e);
      }
    } else {
      await supabaseAdmin.from('orders').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      await supabaseAdmin.from('payment_transactions').update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('reference', reference);
    }

    return new Response(JSON.stringify({ verified, status: transactionStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('verify-payment error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
