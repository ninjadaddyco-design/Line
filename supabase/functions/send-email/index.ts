import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, orderId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Read Resend API key from admin_settings or env
    const { data: keyRow } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'resend_api_key')
      .single();

    const resendKey = keyRow?.value || Deno.env.get('RESEND_API_KEY') || '';

    const { data: storeEmailRow } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'store_email')
      .single();

    const storeEmail = storeEmailRow?.value || 'hello@linedegree.com';

    if (!resendKey) {
      console.log('Resend API key not configured — skipping email');
      return new Response(JSON.stringify({ skipped: true, reason: 'No Resend API key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formatCurrency = (n: number) => `$${Number(n).toFixed(2)}`;
    const customerName = `${order.customer_first_name} ${order.customer_last_name}`;
    const itemsList = order.items?.map((i: { product_name: string; quantity: number; size: string; color: string; total_price: number }) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${i.product_name} (${i.color}/${i.size}) × ${i.quantity}</td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #f0f0f0">${formatCurrency(i.total_price)}</td></tr>`
    ).join('') || '';

    const baseStyle = `font-family:'DM Sans',Arial,sans-serif;background:#fafafa;padding:40px 20px`;
    const containerStyle = `background:white;max-width:560px;margin:0 auto;padding:32px`;
    const logoStyle = `font-size:32px;font-weight:900;letter-spacing:4px;color:#0a0a0a;margin-bottom:24px`;
    const goldStyle = `color:#C9A96E`;
    const btnStyle = `display:inline-block;background:#0a0a0a;color:white;padding:14px 28px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-top:20px`;

    const templates: Record<string, { subject: string; html: string }> = {
      payment_confirmed: {
        subject: `Order Confirmed — ${order.order_number} | LINE°`,
        html: `<div style="${baseStyle}"><div style="${containerStyle}">
          <div style="${logoStyle}">LINE°</div>
          <h2 style="margin:0 0 8px;font-size:22px">Payment Confirmed ✓</h2>
          <p style="color:#666;margin-bottom:20px">Hi ${order.customer_first_name}, your order is confirmed and we're getting it ready.</p>
          <p style="${goldStyle};font-weight:bold;font-size:16px;margin-bottom:16px">Order ${order.order_number}</p>
          <table width="100%" cellpadding="0" cellspacing="0">${itemsList}</table>
          <div style="border-top:2px solid #0a0a0a;padding-top:12px;margin-top:12px">
            <div style="display:flex;justify-content:space-between"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div>
          </div>
          <p style="color:#666;margin-top:20px;font-size:13px">Shipping to: ${order.shipping_address_line1}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}</p>
          <a href="https://linedegree.com/track?order=${order.order_number}&email=${order.customer_email}" style="${btnStyle}">TRACK YOUR ORDER</a>
        </div></div>`,
      },
      order_processing: {
        subject: `Your LINE° order is being prepared — ${order.order_number}`,
        html: `<div style="${baseStyle}"><div style="${containerStyle}">
          <div style="${logoStyle}">LINE°</div>
          <h2 style="margin:0 0 8px;font-size:22px">Being Prepared 📦</h2>
          <p style="color:#666;margin-bottom:20px">Hi ${order.customer_first_name}, we've sent your order to our fulfillment team. We'll notify you when it ships.</p>
          <p style="${goldStyle};font-weight:bold">Order ${order.order_number}</p>
          <a href="https://linedegree.com/track?order=${order.order_number}&email=${order.customer_email}" style="${btnStyle}">TRACK ORDER</a>
        </div></div>`,
      },
      order_shipped: {
        subject: `Your order has shipped! 🚚 — ${order.order_number}`,
        html: `<div style="${baseStyle}"><div style="${containerStyle}">
          <div style="${logoStyle}">LINE°</div>
          <h2 style="margin:0 0 8px;font-size:22px">On Its Way! 🚚</h2>
          <p style="color:#666;margin-bottom:20px">Hi ${order.customer_first_name}, your LINE° pieces are on their way to you.</p>
          <p style="${goldStyle};font-weight:bold">Order ${order.order_number}</p>
          ${order.tracking_number ? `<p style="margin:12px 0">Tracking: <strong style="font-family:monospace">${order.tracking_number}</strong> via ${order.carrier || 'carrier'}</p>` : ''}
          ${order.tracking_url ? `<a href="${order.tracking_url}" style="${btnStyle}">TRACK SHIPMENT</a>` : `<a href="https://linedegree.com/track?order=${order.order_number}&email=${order.customer_email}" style="${btnStyle}">TRACK ORDER</a>`}
        </div></div>`,
      },
      refund_issued: {
        subject: `Refund Issued — ${order.order_number} | LINE°`,
        html: `<div style="${baseStyle}"><div style="${containerStyle}">
          <div style="${logoStyle}">LINE°</div>
          <h2 style="margin:0 0 8px;font-size:22px">Refund Issued</h2>
          <p style="color:#666;margin-bottom:20px">Hi ${order.customer_first_name}, your refund for order ${order.order_number} has been processed. Allow 5–7 business days to appear on your statement.</p>
          <p style="color:#666;font-size:13px">Questions? Contact us at ${storeEmail}</p>
        </div></div>`,
      },
    };

    const template = templates[type];
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `LINE° <${storeEmail}>`,
        to: [order.customer_email],
        subject: template.subject,
        html: template.html,
      }),
    });

    const emailData = await emailRes.json();
    console.log('Resend response:', JSON.stringify(emailData));

    if (!emailRes.ok) {
      return new Response(JSON.stringify({ error: `Resend: ${emailData.message || JSON.stringify(emailData)}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('send-email error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
