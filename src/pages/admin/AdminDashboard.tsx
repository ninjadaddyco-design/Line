import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Package, AlertCircle, DollarSign, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersRes, pendingRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total, payment_status, fulfillment_status, created_at'),
        supabase.from('orders').select('id').eq('payment_status', 'paid').eq('fulfillment_status', 'awaiting_fulfillment'),
        supabase.from('products').select('id, status').eq('status', 'active'),
      ]);
      const orders = ordersRes.data || [];
      const paidOrders = orders.filter((o: { payment_status: string }) => o.payment_status === 'paid');
      const revenue = paidOrders.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);
      const today = new Date().toDateString();
      const todayRevenue = paidOrders
        .filter((o: { created_at: string }) => new Date(o.created_at).toDateString() === today)
        .reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);
      return {
        totalRevenue: revenue,
        todayRevenue,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingFulfillment: pendingRes.data?.length || 0,
        activeProducts: productsRes.data?.length || 0,
        avgOrderValue: paidOrders.length > 0 ? revenue / paidOrders.length : 0,
      };
    },
    refetchInterval: 30000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8);
      return data || [];
    },
  });

  const StatCard = ({ title, value, icon: Icon, sub, color = 'text-[#0a0a0a]' }: { title: string; value: string; icon: React.ElementType; sub?: string; color?: string }) => (
    <div className="bg-white border border-gray-100 p-5 rounded-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <Icon size={18} className="text-gray-300" />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} sub={`${formatCurrency(stats?.todayRevenue || 0)} today`} color="text-green-600" />
          <StatCard title="Total Orders" value={`${stats?.totalOrders || 0}`} icon={ShoppingBag} sub={`${stats?.paidOrders || 0} paid`} />
          <StatCard title="Pending Fulfillment" value={`${stats?.pendingFulfillment || 0}`} icon={RefreshCw} color={stats?.pendingFulfillment ? 'text-yellow-600' : 'text-[#0a0a0a]'} />
          <StatCard title="Avg Order Value" value={formatCurrency(stats?.avgOrderValue || 0)} icon={TrendingUp} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products', icon: Package },
            { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
            { label: 'Fulfillment', href: '/admin/fulfillment', icon: RefreshCw },
            { label: 'Settings', href: '/admin/settings', icon: AlertCircle },
          ].map((item) => (
            <Link key={item.href} to={item.href} className="bg-white border border-gray-100 p-4 flex flex-col items-center gap-2 hover:border-[#C9A96E] transition-colors group text-center">
              <item.icon size={20} className="text-gray-400 group-hover:text-[#C9A96E] transition-colors" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-[#C9A96E] hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((order: { id: string; order_number: string; customer_email: string; total: number; payment_status: string; fulfillment_status: string }) => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders`} className="text-[#C9A96E] font-medium hover:underline">{order.order_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_email}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{order.fulfillment_status.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recentOrders?.length && (
              <p className="text-center text-sm text-gray-400 py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
