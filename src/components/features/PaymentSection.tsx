import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatCurrency, generateOrderNumber, generateReference } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
    ApplePaySession?: {
      canMakePayments: () => boolean;
      STATUS_SUCCESS: number;
      STATUS_FAILURE: number;
    };
  }
}

interface PaymentSectionProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip: string;
  };
  isValid: boolean;
}

export default function PaymentSection({ formData, isValid }: PaymentSectionProps) {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { mutateAsync: createOrder } = useCreateOrder();
  const navigate = useNavigate();
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [paystackEnabled, setPaystackEnabled] = useState(true);
  const [flutterwaveEnabled, setFlutterwaveEnabled] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  useEffect(() => {
    // Load Paystack
    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
    // Load Flutterwave
    if (!document.querySelector('script[src="https://checkout.flutterwave.com/v3.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
    }
    // Check Apple Pay
    const checkApplePay = async () => {
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setApplePayAvailable(true);
      }
    };
    checkApplePay();

    // Load payment provider settings
    const loadSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('key,value').in('key', ['paystack_enabled','flutterwave_enabled']);
      if (data) {
        const ps = data.find((d: { key: string; value: string }) => d.key === 'paystack_enabled');
        const fw = data.find((d: { key: string; value: string }) => d.key === 'flutterwave_enabled');
        setPaystackEnabled(ps?.value !== 'false');
        setFlutterwaveEnabled(fw?.value !== 'false');
      }
    };
    loadSettings();
  }, []);

  const buildOrder = () => {
    const orderNumber = generateOrderNumber();
    const reference = generateReference();
    return {
      order: {
        order_number: orderNumber,
        customer_email: formData.email,
        customer_first_name: formData.first_name,
        customer_last_name: formData.last_name,
        customer_phone: formData.phone,
        shipping_address_line1: formData.address_line1,
        shipping_address_line2: formData.address_line2 || null,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_country: formData.country || 'US',
        shipping_zip: formData.zip,
        subtotal,
        shipping_total: shipping,
        total,
        payment_status: 'pending' as const,
        fulfillment_status: 'awaiting_fulfillment' as const,
        payment_reference: reference,
        fulfillment_attempts: 0,
      },
      items: items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        variant_id: item.variant_id,
        color: item.color,
        size: item.size,
        sku: item.sku,
        cj_product_id: item.cj_product_id,
        cj_variant_id: item.cj_variant_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        image_url: item.image_url,
      })),
      reference,
    };
  };

  const handleVerifyAndComplete = async (orderId: string, reference: string, provider: string, transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, reference, provider, transactionId },
      });

      if (error) {
        const msg = error instanceof Error ? error.message : 'Verification failed';
        toast.error(`Payment verification failed: ${msg}`);
        return;
      }

      if (data?.verified) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      } else {
        toast.error('Payment could not be verified. Please contact support.');
      }
    } catch (e) {
      console.error('Verification error:', e);
      toast.error('Verification error. Your order was saved — contact support.');
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  const handlePaystack = async () => {
    if (!isValid) { toast.error('Please fill in all required fields'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) { toast.error('Payment configuration missing. Contact support.'); return; }

    setLoading('paystack');
    let orderId = '';
    let ref = '';

    try {
      const { order, items: orderItems, reference } = buildOrder();
      ref = reference;
      const createdOrder = await createOrder({ order, items: orderItems });
      orderId = createdOrder.id;

      // Record pending transaction
      await supabase.from('payment_transactions').insert({
        order_id: orderId,
        provider: 'paystack',
        reference,
        amount: total,
        currency: 'USD',
        status: 'pending',
      });
    } catch (e) {
      console.error('Order creation failed:', e);
      toast.error('Failed to create order. Try again.');
      setLoading(null);
      return;
    }

    if (!window.PaystackPop) {
      toast.error('Paystack not loaded. Refresh the page.');
      setLoading(null);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: formData.email,
      amount: Math.round(total * 100),
      currency: 'USD',
      ref,
      firstname: formData.first_name,
      lastname: formData.last_name,
      phone: formData.phone,
      metadata: {
        order_id: orderId,
        order_number: ref,
        custom_fields: [
          { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
        ],
      },
      callback: async (response: { reference: string; transaction: string }) => {
        setLoading('verifying');
        await handleVerifyAndComplete(orderId, response.reference, 'paystack', response.transaction);
        setLoading(null);
      },
      onClose: () => {
        setLoading(null);
        toast.info('Payment cancelled. Your order is saved — complete payment anytime.');
      },
    });

    handler.openIframe();
  };

  const handleApplePay = async () => {
    if (!isValid) { toast.error('Please fill in all required fields'); return; }
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) { toast.error('Payment configuration missing.'); return; }

    setLoading('applepay');
    let orderId = '';
    let ref = '';

    try {
      const { order, items: orderItems, reference } = buildOrder();
      ref = reference;
      const createdOrder = await createOrder({ order, items: orderItems });
      orderId = createdOrder.id;
      await supabase.from('payment_transactions').insert({
        order_id: orderId,
        provider: 'paystack_applepay',
        reference,
        amount: total,
        currency: 'USD',
        status: 'pending',
      });
    } catch {
      toast.error('Failed to create order. Try again.');
      setLoading(null);
      return;
    }

    if (!window.PaystackPop) {
      toast.error('Payment not loaded. Please refresh.');
      setLoading(null);
      return;
    }

    // Paystack Apple Pay uses the same inline handler — Apple Pay is offered as a method inside Paystack's popup on supported devices
    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: formData.email,
      amount: Math.round(total * 100),
      currency: 'USD',
      ref,
      channels: ['apple_pay'],
      metadata: { order_id: orderId },
      callback: async (response: { reference: string; transaction: string }) => {
        setLoading('verifying');
        await handleVerifyAndComplete(orderId, response.reference, 'paystack', response.transaction);
        setLoading(null);
      },
      onClose: () => {
        setLoading(null);
        toast.info('Apple Pay cancelled.');
      },
    });
    handler.openIframe();
  };

  const handleFlutterwave = async () => {
    if (!isValid) { toast.error('Please fill in all required fields'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    const fwKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!fwKey) { toast.error('Payment configuration missing. Contact support.'); return; }

    setLoading('flutterwave');
    let orderId = '';
    let ref = '';

    try {
      const { order, items: orderItems, reference } = buildOrder();
      ref = reference;
      const createdOrder = await createOrder({ order, items: orderItems });
      orderId = createdOrder.id;
      await supabase.from('payment_transactions').insert({
        order_id: orderId,
        provider: 'flutterwave',
        reference,
        amount: total,
        currency: 'USD',
        status: 'pending',
      });
    } catch {
      toast.error('Failed to create order. Try again.');
      setLoading(null);
      return;
    }

    if (!window.FlutterwaveCheckout) {
      toast.error('Flutterwave not loaded. Refresh the page.');
      setLoading(null);
      return;
    }

    window.FlutterwaveCheckout({
      public_key: fwKey,
      tx_ref: ref,
      amount: total,
      currency: 'USD',
      payment_options: 'card',
      customer: {
        email: formData.email,
        name: `${formData.first_name} ${formData.last_name}`,
        phonenumber: formData.phone,
      },
      meta: { order_id: orderId },
      customizations: {
        title: 'LINE°',
        description: `Order ${ref}`,
        logo: '',
      },
      callback: async (data: { transaction_id: string; tx_ref: string; status: string }) => {
        if (data.status === 'successful' || data.status === 'completed') {
          setLoading('verifying');
          await handleVerifyAndComplete(orderId, data.tx_ref, 'flutterwave', data.transaction_id.toString());
        } else {
          toast.error('Payment failed. Please try again.');
        }
        setLoading(null);
      },
      onclose: () => {
        setLoading(null);
        toast.info('Payment cancelled. Your order is saved.');
      },
    });
  };

  const isProcessing = !!loading;

  return (
    <div className="space-y-3">
      {/* Order summary mini */}
      <div className="border border-gray-200 p-4 bg-gray-50/50 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span>{shippingFree ? 'FREE' : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Apple Pay */}
      {applePayAvailable && paystackEnabled && (
        <button
          onClick={handleApplePay}
          disabled={isProcessing}
          className="w-full bg-black text-white py-4 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
        >
          {loading === 'applepay' ? (
            <span className="text-sm">Processing…</span>
          ) : (
            <>
              <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
                <path d="M16.462 8.438c-.065 5.068 4.395 7.576 4.538 7.659-2.519 7.341-6.464 10.218-9.744 10.276-2.481.046-4.168-1.395-5.956-1.395-1.788 0-3.587 1.359-5.125 1.34C-1.84 26.298-5.04 18.84-5.04 15.027c0-8.127 6.019-12.072 11.476-12.148 2.377-.032 4.598 1.411 5.972 1.411 1.374 0 3.99-1.729 6.649-1.477.454 1.657.162 6.538-2.595 5.625z"/>
                <path d="M13.573 2.25c.597-2.283.079-4.617-1.372-6.25-1.37-1.539-3.562-2.757-5.723-2.654C6.254-4.384 5.963-2.002 7.312-.47c1.311 1.483 3.437 2.647 6.261 2.72z"/>
              </svg>
              Pay with Apple Pay
            </>
          )}
        </button>
      )}

      {/* Divider */}
      {applePayAvailable && (paystackEnabled || flutterwaveEnabled) && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Paystack Card */}
      {paystackEnabled && (
        <button
          onClick={handlePaystack}
          disabled={isProcessing}
          className="w-full bg-[#0a0a0a] text-white py-4 text-sm font-semibold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors"
        >
          {loading === 'paystack' || loading === 'verifying' ? 'Processing…' : 'PAY WITH CARD — PAYSTACK'}
        </button>
      )}

      {/* Flutterwave Card */}
      {flutterwaveEnabled && (
        <button
          onClick={handleFlutterwave}
          disabled={isProcessing}
          className="w-full border-2 border-[#F5A623] text-[#0a0a0a] py-4 text-sm font-semibold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5A623] transition-colors"
        >
          {loading === 'flutterwave' ? 'Processing…' : 'PAY WITH CARD — FLUTTERWAVE'}
        </button>
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-1">
        <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><path d="M6 0L0 2.5V7c0 3.5 2.5 5.9 6 7 3.5-1.1 6-3.5 6-7V2.5L6 0zm0 6.5c-.8 0-1.5-.7-1.5-1.5S5.2 3.5 6 3.5 7.5 4.2 7.5 5 6.8 6.5 6 6.5zm1 3H5V7h2v2.5z"/></svg>
        Secured by SSL encryption. We never store card details.
      </div>
    </div>
  );
}
