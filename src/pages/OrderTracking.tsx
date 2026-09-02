import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrderTracker from '@/components/features/OrderTracker';
import { useOrderByNumber } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [submitted, setSubmitted] = useState(!!(searchParams.get('order') && searchParams.get('email')));

  const { data: order, isLoading, error } = useOrderByNumber(submitted ? orderNumber : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const orderMatchesEmail = order && order.customer_email.toLowerCase() === email.toLowerCase();

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-3">TRACK ORDER</h1>
        <p className="text-gray-500 text-sm mb-10">Enter your order number and email to track your package.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Order Number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="LN-XXXXXX-XXXX"
              className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">TRACK MY ORDER</button>
        </form>

        {isLoading && <div className="text-center py-8"><div className="shimmer w-8 h-8 rounded-full mx-auto" /></div>}

        {submitted && !isLoading && !order && (
          <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Order not found. Please check your order number and try again.
          </div>
        )}

        {order && !orderMatchesEmail && (
          <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Email address does not match this order.
          </div>
        )}

        {order && orderMatchesEmail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
                <p className="font-bold text-[#C9A96E] tracking-wider">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Ordered On</p>
                <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <OrderTracker order={order} />

            {/* Items */}
            <div className="border border-gray-100 p-5">
              <h3 className="text-xs font-bold tracking-[0.18em] uppercase mb-4">Items</h3>
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{item.product_name} × {item.quantity}</p>
                    <p className="text-xs text-gray-400">{item.color} / {item.size}</p>
                  </div>
                  <span>{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div className="border border-gray-100 p-5">
              <h3 className="text-xs font-bold tracking-[0.18em] uppercase mb-3">Shipping To</h3>
              <p className="text-sm text-gray-600">
                {order.customer_first_name} {order.customer_last_name}<br />
                {order.shipping_address_line1}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
