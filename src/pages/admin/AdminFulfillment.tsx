import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useFulfillmentRecords } from '@/hooks/useAdminData';
import { useOrders, useUpdateOrder } from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminFulfillment() {
  const { data: records } = useFulfillmentRecords();
  const { data: orders } = useOrders();
  const { mutateAsync: updateOrder } = useUpdateOrder();
  const [retrying, setRetrying] = useState('');

  const pendingOrders = orders?.filter((o) => o.payment_status === 'paid' && o.fulfillment_status === 'awaiting_fulfillment') || [];
  const errorOrders = orders?.filter((o) => o.fulfillment_status === 'fulfillment_error') || [];

  const handleRetry = async (orderId: string) => {
    setRetrying(orderId);
    try {
      const { error } = await supabase.functions.invoke('cj-fulfillment', {
        body: { orderId, retry: true },
      });
      if (error) throw new Error(error.message);
      toast.success('Fulfillment retry submitted to CJ');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Retry failed: ${msg}`);
    }
    setRetrying('');
  };

  const handleManualFulfill = async (orderId: string) => {
    await updateOrder({ id: orderId, updates: { fulfillment_status: 'shipped', fulfillment_error: null } });
    toast.success('Order marked as shipped (manual)');
  };

  return (
    <AdminLayout title="Fulfillment">
      <div className="space-y-6">
        {/* Pending fulfillment */}
        <div>
          <h2 className="font-semibold text-sm mb-3">Awaiting Fulfillment ({pendingOrders.length})</h2>
          <div className="bg-white border border-gray-100">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">All caught up! No pending orders.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order', 'Customer', 'Items', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-50">
                      <td className="px-4 py-3 font-medium text-[#C9A96E]">{order.order_number}</td>
                      <td className="px-4 py-3 text-gray-600">{order.customer_email}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{order.items?.map((i) => `${i.product_name} (${i.size})`).join(', ')}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRetry(order.id)}
                          disabled={retrying === order.id}
                          className="bg-[#0a0a0a] text-white text-[10px] font-semibold px-3 py-1.5 hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors disabled:opacity-50"
                        >
                          {retrying === order.id ? 'Sending…' : 'SEND TO CJ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Error orders */}
        {errorOrders.length > 0 && (
          <div>
            <h2 className="font-semibold text-sm mb-3 text-red-600">Fulfillment Errors ({errorOrders.length})</h2>
            <div className="bg-white border border-red-100">
              <table className="w-full text-sm">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    {['Order', 'Customer', 'Error', 'Attempts', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {errorOrders.map((order) => (
                    <tr key={order.id} className="border-t border-red-50">
                      <td className="px-4 py-3 font-medium text-[#C9A96E]">{order.order_number}</td>
                      <td className="px-4 py-3 text-gray-600">{order.customer_email}</td>
                      <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate">{order.fulfillment_error || 'Unknown error'}</td>
                      <td className="px-4 py-3">{order.fulfillment_attempts}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleRetry(order.id)} disabled={retrying === order.id} className="text-[10px] font-semibold text-orange-600 hover:underline disabled:opacity-50">
                          {retrying === order.id ? 'Retrying…' : 'Retry CJ'}
                        </button>
                        <button onClick={() => handleManualFulfill(order.id)} className="text-[10px] font-semibold text-blue-600 hover:underline">
                          Manual Fulfill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fulfillment logs */}
        <div>
          <h2 className="font-semibold text-sm mb-3">Fulfillment Logs</h2>
          <div className="bg-white border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order', 'CJ Order ID', 'Status', 'Attempt', 'Date', 'Error'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records?.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">No fulfillment records</td></tr>
                ) : records?.map((r: { id: string; order: { order_number: string } | null; cj_order_id: string | null; status: string; attempt_number: number; created_at: string; error_message: string | null }) => (
                  <tr key={r.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 text-[#C9A96E]">{r.order?.order_number || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.cj_order_id || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 ${r.status === 'success' ? 'bg-green-100 text-green-700' : r.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.attempt_number}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-red-500 max-w-xs truncate">{r.error_message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
