import AdminLayout from '@/components/layout/AdminLayout';
import { useCustomers } from '@/hooks/useAdminData';
import { formatCurrency } from '@/lib/utils';

export default function AdminCustomers() {
  const { data: customers, isLoading } = useCustomers();

  return (
    <AdminLayout title="Customers">
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">{customers?.length || 0} customers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Email', 'Name', 'Phone', 'Orders', 'Total Spent', 'Since'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Loading…</td></tr>
              ) : customers?.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No customers yet</td></tr>
              ) : customers?.map((c) => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3">{c.total_orders}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(c.total_spent)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
