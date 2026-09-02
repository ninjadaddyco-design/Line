import { useState } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useOrderByEmail } from '@/hooks/useOrders';
import OrderTracker from '@/components/features/OrderTracker';
import { formatCurrency } from '@/lib/utils';

export default function Account() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { data: orders, isLoading } = useOrderByEmail(submitted ? email : '');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-3">MY ORDERS</h1>
        <p className="text-gray-500 text-sm mb-10">Enter your email to view your order history.</p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
            placeholder="your@email.com"
            className="flex-1 border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a]"
            required
          />
          <button type="submit" className="btn-primary px-6">FIND ORDERS</button>
        </form>

        {isLoading && <p className="text-sm text-gray-400">Searching…</p>}

        {submitted && !isLoading && orders?.length === 0 && (
          <p className="text-sm text-gray-500">No orders found for this email.</p>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[#C9A96E] font-bold text-sm tracking-wider">#{order.order_number}</span>
                    <span className="text-xs text-gray-400 ml-3">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                    <span className="font-bold text-sm">{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {order.items?.map((i) => `${i.product_name} (${i.size})`).join(', ')}
                </div>
                <button
                  onClick={() => setSelectedOrderId(selectedOrderId === order.id ? '' : order.id)}
                  className="text-xs font-semibold uppercase tracking-wider underline hover:text-[#C9A96E] transition-colors"
                >
                  {selectedOrderId === order.id ? 'Hide Details' : 'View Details & Track'}
                </button>

                {selectedOrderId === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <OrderTracker order={order} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
