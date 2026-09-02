import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useTikTokContent, useUpsertTikTokContent } from '@/hooks/useAdminData';
import { useAllAdminProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';

export default function AdminTikTok() {
  const { data: content } = useTikTokContent();
  const { data: products } = useAllAdminProducts();
  const { mutateAsync: upsert } = useUpsertTikTokContent();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const totalRevenue = content?.reduce((s: number, c: { revenue: number }) => s + Number(c.revenue || 0), 0) || 0;
  const totalViews = content?.reduce((s: number, c: { views: number }) => s + Number(c.views || 0), 0) || 0;
  const totalOrders = content?.reduce((s: number, c: { orders_count: number }) => s + Number(c.orders_count || 0), 0) || 0;

  const inputClass = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]';

  return (
    <AdminLayout title="TikTok Content Tracker">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString() },
            { label: 'Total Orders', value: totalOrders },
            { label: 'Revenue from TikTok', value: formatCurrency(totalRevenue) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="font-bold text-xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={() => setEditing({})} className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
            <Plus size={14} /> ADD VIDEO
          </button>
        </div>

        {/* Content table */}
        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Date', 'Hook', 'Product', 'Views', 'Likes', 'Orders', 'Revenue', 'Edit'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content?.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No TikTok content tracked yet</td></tr>
              ) : content?.map((c: Record<string, unknown>) => (
                <tr key={c.id as string} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">{c.post_date ? new Date(c.post_date as string).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 max-w-[160px] truncate">{c.hook as string || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{(c.product as { name: string } | null)?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium">{(c.views as number || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{(c.likes as number || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.orders_count as number || 0}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(Number(c.revenue) || 0)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditing(c)} className="p-1 hover:text-[#C9A96E]"><Edit size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit form */}
        {editing !== null && (
          <div className="bg-white border border-gray-200 p-5">
            <h3 className="font-semibold mb-4">{editing.id ? 'Edit Video' : 'Add Video'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Video URL</label>
                <input value={(editing.video_url as string) || ''} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} className={inputClass} placeholder="https://tiktok.com/@..." />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Post Date</label>
                <input type="date" value={(editing.post_date as string) || ''} onChange={(e) => setEditing({ ...editing, post_date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Product</label>
                <select value={(editing.product_id as string) || ''} onChange={(e) => setEditing({ ...editing, product_id: e.target.value })} className={`${inputClass} checkout-select bg-white`}>
                  <option value="">Select product</option>
                  {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Hook (opening line)</label>
                <input value={(editing.hook as string) || ''} onChange={(e) => setEditing({ ...editing, hook: e.target.value })} className={inputClass} />
              </div>
              {(['views','likes','comments','shares','saves','profile_visits','link_clicks','orders_count'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 capitalize">{field.replace(/_/g, ' ')}</label>
                  <input type="number" value={(editing[field] as number) || 0} onChange={(e) => setEditing({ ...editing, [field]: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Revenue ($)</label>
                <input type="number" step="0.01" value={(editing.revenue as number) || 0} onChange={(e) => setEditing({ ...editing, revenue: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={async () => { await upsert(editing); setEditing(null); }} className="bg-[#0a0a0a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
