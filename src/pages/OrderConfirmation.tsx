import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OrderTracker from '@/components/features/OrderTracker';
import { useOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id || '');

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="flex items-center justify-center py-24">
        <div className="shimmer w-10 h-10 rounded-full" />
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="text-center py-24">
        <h1 className="font-display text-4xl mb-4">ORDER NOT FOUND</h1>
        <Link to="/" className="btn-primary">RETURN HOME</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Confirmation header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-[#0a0a0a] mb-2">
            {order.payment_status === 'paid' ? 'ORDER CONFIRMED!' : 'ORDER RECEIVED'}
          </h1>
          <p className="text-gray-500 text-sm">
            {order.payment_status === 'paid'
              ? `Thank you ${order.customer_first_name}! Your order has been confirmed.`
              : `Your order has been received. We're awaiting payment confirmation.`}
          </p>
          <p className="text-[#C9A96E] font-bold tracking-widest uppercase text-sm mt-2">
            Order #{order.order_number}
          </p>
        </div>

        {/* Tracking */}
        <div className="border border-gray-100 p-6 mb-6">
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase mb-5">Order Status</h2>
          <OrderTracker order={order} />
        </div>

        {/* Items */}
        <div className="border border-gray-100 p-6 mb-6">
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{item.product_name} × {item.quantity}</p>
                  <p className="text-xs text-gray-400">{item.color} / {item.size}</p>
                </div>
                <span className="font-bold">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{order.shipping_total === 0 ? 'FREE' : formatCurrency(order.shipping_total)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="border border-gray-100 p-6 mb-6">
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase mb-3">Shipping To</h2>
          <p className="text-sm text-gray-600">
            {order.customer_first_name} {order.customer_last_name}<br />
            {order.shipping_address_line1}{order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}<br />
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
            {order.shipping_country}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/track?order=${order.order_number}&email=${order.customer_email}`} className="btn-primary flex items-center justify-center gap-2">
            <Package size={15} />
            TRACK ORDER
          </Link>
          <Link to="/shop" className="btn-outline flex items-center justify-center gap-2">
            CONTINUE SHOPPING <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
