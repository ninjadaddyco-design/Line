import { useState } from 'react';
import { Search, ChevronDown, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useOrders, useUpdateOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_STATUS_LABELS, FULFILLMENT_STATUS_LABELS } from '@/constants';
import { Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminOrders() {
  const { data: orders, isLoading, refetch } = useOrders();
  const { mutateAsync: updateOrder } = useUpdateOrder();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [retrying, setRetrying] = useState('');

  const filtered = (orders || []).filter((o) => {
    const matchesSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.payment_status === statusFilter || o.fulfillment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetryFulfillment = async (order: Order) => {
    if (order.payment_status !== 'paid') { toast.error('Order must be paid before fulfillment'); return; }
    setRetrying(order.id);
    try {
      const { error } = await supabase.functions.invoke('cj-fulfillment', {
        body: { orderId: order.id, retry: true },
      });
      if (error) throw error;
      toast.success('Fulfillment retry sent to CJ');
      refetch();
    } catch (e) {
      toast.error('Retry failed. Check fulfillment logs.');
    }
    setRetrying('');
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-[#0a0a0a]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2.5 text-sm focus:outline-none checkout-select bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="awaiting_fulfillment">Awaiting Fulfillment</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="fulfillment_error">Fulfillment Error</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Fulfillment', 'CJ Order', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No orders found</td></tr>
                ) : filtered.map((order) => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} className="text-[#C9A96E] font-medium hover:underline">
                        {order.order_number}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{order.customer_email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${
                        order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.fulfillment_status === 'fulfillment_error' ? 'bg-red-100 text-red-700' :
                        order.fulfillment_status === 'shipped' || order.fulfillment_status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {FULFILLMENT_STATUS_LABELS[order.fulfillment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.cj_order_id || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {order.fulfillment_status === 'fulfillment_error' && (
                          <button
                            onClick={() => handleRetryFulfillment(order)}
                            disabled={retrying === order.id}
                            className="text-[10px] font-semibold text-orange-600 hover:underline whitespace-nowrap disabled:opacity-50"
                          >
                            {retrying === order.id ? 'Retrying…' : 'Retry CJ'}
                          </button>
                        )}
                        {order.tracking_url && (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                            Track <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order detail */}
        {selectedOrder && (
          <div className="bg-white border border-gray-100 p-5">
            <h3 className="font-semibold mb-4">Order {selectedOrder.order_number} — Details</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Shipping Address</p>
                <p className="text-sm">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.shipping_address_line1}</p>
                <p className="text-sm text-gray-500">{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Items</p>
                {selectedOrder.items?.map((item) => (
                  <p key={item.id} className="text-sm">{item.product_name} × {item.quantity} — {item.color}/{item.size} — {formatCurrency(item.total_price)}</p>
                ))}
              </div>
            </div>
            {selectedOrder.fulfillment_error && (
              <div className="mt-4 bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <strong>Fulfillment Error:</strong> {selectedOrder.fulfillment_error}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <select
                defaultValue={selectedOrder.fulfillment_status}
                onChange={async (e) => {
                  await updateOrder({ id: selectedOrder.id, updates: { fulfillment_status: e.target.value as Order['fulfillment_status'] } });
                  refetch();
                }}
                className="border border-gray-200 px-3 py-2 text-sm checkout-select bg-white"
              >
                {Object.entries(FULFILLMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input
                placeholder="Tracking number"
                defaultValue={selectedOrder.tracking_number || ''}
                onBlur={async (e) => {
                  if (e.target.value !== selectedOrder.tracking_number) {
                    await updateOrder({ id: selectedOrder.id, updates: { tracking_number: e.target.value } });
                  }
                }}
                className="border border-gray-200 px-3 py-2 text-sm focus:outline-none flex-1"
              />
              <input
                placeholder="Tracking URL"
                defaultValue={selectedOrder.tracking_url || ''}
                onBlur={async (e) => {
                  if (e.target.value !== selectedOrder.tracking_url) {
                    await updateOrder({ id: selectedOrder.id, updates: { tracking_url: e.target.value } });
                  }
                }}
                className="border border-gray-200 px-3 py-2 text-sm focus:outline-none flex-1"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">{filtered.length} of {orders?.length || 0} orders shown</p>
      </div>
    </AdminLayout>
  );
}
