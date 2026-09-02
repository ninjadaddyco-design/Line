import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total, payment_status, created_at, fulfillment_status'),
        supabase.from('products').select('id, name, status'),
      ]);
      const orders = ordersRes.data || [];
      const paid = orders.filter((o: { payment_status: string }) => o.payment_status === 'paid');
      const revenue = paid.reduce((s: number, o: { total: number }) => s + Number(o.total), 0);
      const refunded = orders.filter((o: { payment_status: string }) => o.payment_status === 'refunded').length;

      // Daily revenue last 7 days
      const days: { date: string; revenue: number; orders: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayOrders = paid.filter((o: { created_at: string }) => o.created_at.startsWith(dateStr));
        days.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((s: number, o: { total: number }) => s + Number(o.total), 0),
          orders: dayOrders.length,
        });
      }

      return {
        revenue, totalOrders: orders.length, paidOrders: paid.length,
        avgOrderValue: paid.length > 0 ? revenue / paid.length : 0,
        refundRate: orders.length > 0 ? (refunded / orders.length) * 100 : 0,
        dailyData: days,
        activeProducts: productsRes.data?.filter((p: { status: string }) => p.status === 'active').length || 0,
      };
    },
  });

  const MetricCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white border border-gray-100 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-bold text-2xl">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Revenue (All Time)" value={formatCurrency(analytics?.revenue || 0)} />
          <MetricCard label="Total Orders" value={`${analytics?.totalOrders || 0}`} sub={`${analytics?.paidOrders || 0} paid`} />
          <MetricCard label="Avg Order Value" value={formatCurrency(analytics?.avgOrderValue || 0)} />
          <MetricCard label="Refund Rate" value={`${(analytics?.refundRate || 0).toFixed(1)}%`} />
        </div>

        {/* Revenue chart */}
        <div className="bg-white border border-gray-100 p-5">
          <h2 className="font-semibold text-sm mb-4">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#C9A96E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="bg-white border border-gray-100 p-5">
          <h2 className="font-semibold text-sm mb-4">Orders — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#0a0a0a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
