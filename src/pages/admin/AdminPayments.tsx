import AdminLayout from '@/components/layout/AdminLayout';
import { usePaymentTransactions } from '@/hooks/useAdminData';
import { formatCurrency } from '@/lib/utils';

export default function AdminPayments() {
  const { data: transactions } = usePaymentTransactions();

  const paid = transactions?.filter((t: { status: string }) => t.status === 'success' || t.status === 'paid') || [];
  const failed = transactions?.filter((t: { status: string }) => t.status === 'failed') || [];
  const revenue = paid.reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0);

  return (
    <AdminLayout title="Payments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(revenue) },
            { label: 'Transactions', value: transactions?.length || 0 },
            { label: 'Failed', value: failed.length },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="font-bold text-xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Transactions table */}
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Reference', 'Provider', 'Amount', 'Currency', 'Status', 'Webhook', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions?.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No transactions yet</td></tr>
              ) : transactions?.map((t: {
                id: string;
                reference: string | null;
                provider: string;
                amount: number;
                currency: string;
                status: string;
                webhook_received: boolean;
                created_at: string;
              }) => (
                <tr key={t.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.reference || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${t.provider.includes('paystack') ? 'bg-gray-100 text-gray-700' : t.provider.includes('flutter') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{t.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${
                      t.status === 'paid' || t.status === 'success' ? 'bg-green-100 text-green-700' :
                      t.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{t.status.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${t.webhook_received ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.webhook_received ? 'RECEIVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
