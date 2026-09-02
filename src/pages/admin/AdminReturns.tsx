import AdminLayout from '@/components/layout/AdminLayout';
import { useReturns, useUpdateReturn } from '@/hooks/useAdminData';

export default function AdminReturns() {
  const { data: returns } = useReturns();
  const { mutateAsync: updateReturn } = useUpdateReturn();

  const statusColors: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    refund_issued: 'bg-green-100 text-green-700',
    replacement_sent: 'bg-purple-100 text-purple-700',
  };

  return (
    <AdminLayout title="Returns">
      <div className="bg-white border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Reason', 'Status', 'CJ Ref', 'Refund', 'Date', 'Update Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returns?.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No returns submitted</td></tr>
            ) : returns?.map((r: {
              id: string;
              customer_email: string;
              reason: string;
              status: string;
              cj_dispute_reference: string | null;
              refund_amount: number | null;
              created_at: string;
            }) => (
              <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">{r.customer_email}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{r.reason}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {r.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.cj_dispute_reference || '—'}</td>
                <td className="px-4 py-3">{r.refund_amount ? `$${r.refund_amount}` : '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateReturn({ id: r.id, updates: { status: e.target.value } })}
                    className="border border-gray-200 px-2 py-1 text-xs checkout-select bg-white"
                  >
                    {['submitted', 'under_review', 'approved', 'rejected', 'refund_issued', 'replacement_sent'].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
