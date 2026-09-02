import { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useSuppliers, useUpsertSupplier } from '@/hooks/useAdminData';
import { useAllAdminProducts } from '@/hooks/useProducts';
import { Supplier } from '@/types';

const emptySupplier: Partial<Supplier> = {
  name: 'CJ Dropshipping', cj_product_id: '', product_url: '', cost: undefined, shipping_cost: undefined,
  processing_time: '3-5 days', shipping_method: 'ePacket', notes: '', active: true,
};

export default function AdminSuppliers() {
  const { data: suppliers } = useSuppliers();
  const { data: products } = useAllAdminProducts();
  const { mutateAsync: upsertSupplier } = useUpsertSupplier();
  const [editing, setEditing] = useState<Partial<Supplier> | null>(null);
  const inputClass = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a]';

  return (
    <AdminLayout title="Suppliers">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setEditing(emptySupplier)} className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
            <Plus size={14} /> ADD SUPPLIER
          </button>
        </div>

        <div className="bg-white border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Supplier', 'CJ Product ID', 'Cost', 'Shipping', 'Processing', 'Method', 'Verified', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers?.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No suppliers configured</td></tr>
              ) : suppliers?.map((s) => (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="px-4 py-3">{s.product?.name || '—'}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.cj_product_id || '—'}</td>
                  <td className="px-4 py-3">{s.cost ? `$${s.cost}` : '—'}</td>
                  <td className="px-4 py-3">{s.shipping_cost ? `$${s.shipping_cost}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.processing_time || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.shipping_method || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.last_verified || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditing(s)} className="p-1 hover:text-[#C9A96E]"><Edit size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Supplier Details</h3>
              <button onClick={() => setEditing(null)}><X size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Product</label>
                <select value={editing.product_id || ''} onChange={(e) => setEditing({ ...editing, product_id: e.target.value })} className={`${inputClass} checkout-select bg-white`}>
                  <option value="">Select product</option>
                  {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Supplier Name</label>
                <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">CJ Product ID</label>
                <input value={editing.cj_product_id || ''} onChange={(e) => setEditing({ ...editing, cj_product_id: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Product URL</label>
                <input value={editing.product_url || ''} onChange={(e) => setEditing({ ...editing, product_url: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Cost ($)</label>
                <input type="number" step="0.01" value={editing.cost || ''} onChange={(e) => setEditing({ ...editing, cost: parseFloat(e.target.value) || undefined })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Shipping Cost ($)</label>
                <input type="number" step="0.01" value={editing.shipping_cost || ''} onChange={(e) => setEditing({ ...editing, shipping_cost: parseFloat(e.target.value) || undefined })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Processing Time</label>
                <input value={editing.processing_time || ''} onChange={(e) => setEditing({ ...editing, processing_time: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Shipping Method</label>
                <input value={editing.shipping_method || ''} onChange={(e) => setEditing({ ...editing, shipping_method: e.target.value })} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Notes</label>
                <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={`${inputClass} resize-none`} rows={2} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={async () => { await upsertSupplier(editing); setEditing(null); }} className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
                <Check size={14} /> Save
              </button>
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
