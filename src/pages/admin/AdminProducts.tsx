import { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Upload, X, Check, Image } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAllAdminProducts, useUpsertProduct, useDeleteProduct, useAddProductImage, useDeleteProductImage, useUpsertVariant, useDeleteVariant } from '@/hooks/useProducts';
import { useImageUpload } from '@/hooks/useImageUpload';
import { formatCurrency, slugify } from '@/lib/utils';
import { PRODUCT_SIZES, PRODUCT_STATUS_LABELS } from '@/constants';
import { Product, ProductVariant } from '@/types';
import { toast } from 'sonner';

const COLORS = ['Black', 'White', 'Cream', 'Camel', 'Ivory', 'Chocolate', 'Stone', 'Sage', 'Charcoal', 'Navy', 'Nude'];

const emptyProduct = {
  name: '', slug: '', description: '', price: 0, compare_at_price: null, supplier_cost: null,
  shipping_cost: 4.99, material: '', fit: '', care_instructions: '', shipping_info: '3–7 business days to the US',
  return_info: '30-day returns on unworn items', cj_product_id: '', status: 'draft' as const, featured: false, sort_order: 0,
};

export default function AdminProducts() {
  const { data: products, isLoading } = useAllAdminProducts();
  const { mutateAsync: upsertProduct } = useUpsertProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: addImage } = useAddProductImage();
  const { mutateAsync: deleteImage } = useDeleteProductImage();
  const { mutateAsync: upsertVariant } = useUpsertVariant();
  const { mutateAsync: deleteVariant } = useDeleteVariant();
  const { upload, uploading } = useImageUpload('product-images');

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newVariantColor, setNewVariantColor] = useState('');
  const [newVariantSize, setNewVariantSize] = useState('');
  const [newVariantPriceAdj, setNewVariantPriceAdj] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fitPhotoRef = useRef<HTMLInputElement>(null);
  const sizeChartRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: upsertSizeGuide } = {
    mutateAsync: async (data: { product_id: string; fit_photo_url?: string; size_chart_url?: string }) => {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('size_guide_images').upsert({ ...data, is_global: false }, { onConflict: 'product_id' });
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name) { toast.error('Product name required'); return; }
    const product = {
      ...editingProduct,
      slug: editingProduct.slug || slugify(editingProduct.name),
    };
    await upsertProduct(product);
    setEditingProduct(null);
    setIsNew(false);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editingProduct?.id) { toast.error('Save product first before uploading images'); return; }
    for (const file of Array.from(files)) {
      const url = await upload(file);
      if (url) {
        const isPrimary = !editingProduct.images?.length;
        await addImage({
          product_id: editingProduct.id,
          url,
          alt_text: editingProduct.name || '',
          is_primary: isPrimary,
          color_variant: null,
          sort_order: editingProduct.images?.length || 0,
        });
        toast.success('Image uploaded');
      }
    }
  };

  const handleAddVariant = async () => {
    if (!editingProduct?.id) { toast.error('Save product first'); return; }
    if (!newVariantColor || !newVariantSize) { toast.error('Select color and size'); return; }
    await upsertVariant({
      product_id: editingProduct.id,
      color: newVariantColor,
      size: newVariantSize,
      price_adjustment: newVariantPriceAdj,
      sku: `${editingProduct.name?.substring(0, 3).toUpperCase()}-${newVariantColor.substring(0, 3).toUpperCase()}-${newVariantSize}`,
      active: true,
      stock_quantity: 999,
    });
    setNewVariantColor('');
    setNewVariantSize('');
    setNewVariantPriceAdj(0);
    toast.success('Variant added');
  };

  const handleSizeGuideUpload = async (file: File, type: 'fit_photo_url' | 'size_chart_url') => {
    if (!editingProduct?.id) { toast.error('Save product first'); return; }
    const { uploadImage } = await import('@/lib/storage');
    const { url } = await uploadImage('product-images', file, `size-guide/${editingProduct.id}-${type}.${file.name.split('.').pop()}`);
    if (url) {
      await upsertSizeGuide({ product_id: editingProduct.id, [type]: url });
      toast.success('Size guide image uploaded');
    }
  };

  const inputClass = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors';

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{products?.length || 0} products</p>
          <button
            onClick={() => { setEditingProduct(emptyProduct); setIsNew(true); }}
            className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors"
          >
            <Plus size={14} /> ADD PRODUCT
          </button>
        </div>

        {/* Product list */}
        <div className="grid gap-3">
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : products?.map((product) => (
            <div key={product.id} className="bg-white border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-14 h-16 shrink-0 bg-gray-50 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Image size={16} className="text-gray-300" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{formatCurrency(product.price)} • {product.variants?.length || 0} variants • {product.images?.length || 0} images</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${
                product.status === 'active' ? 'bg-green-100 text-green-700' :
                product.status === 'winner' ? 'bg-[#C9A96E]/20 text-[#C9A96E]' :
                'bg-gray-100 text-gray-500'
              }`}>
                {PRODUCT_STATUS_LABELS[product.status]}
              </span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditingProduct(product); setIsNew(false); }} className="p-2 hover:text-[#C9A96E] transition-colors">
                  <Edit size={14} />
                </button>
                <button onClick={async () => { if (confirm('Delete product?')) await deleteProduct(product.id); }} className="p-2 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit / New product panel */}
        {editingProduct && (
          <div className="bg-white border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{isNew ? 'New Product' : 'Edit Product'}</h2>
              <button onClick={() => { setEditingProduct(null); setIsNew(false); }}><X size={18} /></button>
            </div>

            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Product Name *</label>
                <input value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value, slug: slugify(e.target.value) })} className={inputClass} placeholder="Wide-Leg Trousers" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Slug</label>
                <input value={editingProduct.slug || ''} onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })} className={inputClass} placeholder="auto-generated" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Price (USD) *</label>
                <input type="number" step="0.01" value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className={inputClass} placeholder="49.99" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Compare-At Price</label>
                <input type="number" step="0.01" value={editingProduct.compare_at_price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: parseFloat(e.target.value) || null })} className={inputClass} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Supplier Cost</label>
                <input type="number" step="0.01" value={editingProduct.supplier_cost || ''} onChange={(e) => setEditingProduct({ ...editingProduct, supplier_cost: parseFloat(e.target.value) || null })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Shipping Cost</label>
                <input type="number" step="0.01" value={editingProduct.shipping_cost || ''} onChange={(e) => setEditingProduct({ ...editingProduct, shipping_cost: parseFloat(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                <select value={editingProduct.status || 'draft'} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as Product['status'] })} className={`${inputClass} checkout-select bg-white`}>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">CJ Product ID</label>
                <input value={editingProduct.cj_product_id || ''} onChange={(e) => setEditingProduct({ ...editingProduct, cj_product_id: e.target.value })} className={inputClass} placeholder="CJ Dropshipping product ID" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Description</label>
              <textarea value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Material</label>
                <input value={editingProduct.material || ''} onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Fit</label>
                <input value={editingProduct.fit || ''} onChange={(e) => setEditingProduct({ ...editingProduct, fit: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Care Instructions</label>
                <input value={editingProduct.care_instructions || ''} onChange={(e) => setEditingProduct({ ...editingProduct, care_instructions: e.target.value })} className={inputClass} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="featured" checked={editingProduct.featured || false} onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="featured" className="text-sm font-medium">Featured on Homepage</label>
              </div>
            </div>

            {/* Images section */}
            {editingProduct.id && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Product Images</label>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-xs font-semibold border border-gray-200 px-3 py-1.5 hover:border-[#0a0a0a] transition-colors disabled:opacity-50">
                    <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload Images'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {editingProduct.images?.map((img) => (
                    <div key={img.id} className="relative group w-20 h-24 bg-gray-50 overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                      {img.is_primary && <span className="absolute bottom-0 left-0 right-0 bg-[#C9A96E] text-[8px] text-center text-white font-bold py-0.5">PRIMARY</span>}
                      <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {(!editingProduct.images || editingProduct.images.length === 0) && (
                    <p className="text-xs text-gray-400">No images yet. Upload to add.</p>
                  )}
                </div>
              </div>
            )}

            {/* Size guide upload */}
            {editingProduct.id && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-3">Size Guide Images</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Fit Photo (model wearing piece)</p>
                    <button onClick={() => fitPhotoRef.current?.click()} className="flex items-center gap-2 text-xs border border-gray-200 px-3 py-2 w-full justify-center hover:border-[#0a0a0a]">
                      <Upload size={12} /> Upload Fit Photo
                    </button>
                    <input ref={fitPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSizeGuideUpload(e.target.files[0], 'fit_photo_url')} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Size Chart Image</p>
                    <button onClick={() => sizeChartRef.current?.click()} className="flex items-center gap-2 text-xs border border-gray-200 px-3 py-2 w-full justify-center hover:border-[#0a0a0a]">
                      <Upload size={12} /> Upload Size Chart
                    </button>
                    <input ref={sizeChartRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSizeGuideUpload(e.target.files[0], 'size_chart_url')} />
                  </div>
                </div>
              </div>
            )}

            {/* Variants */}
            {editingProduct.id && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-3">Variants</label>
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-xs border border-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Color', 'Size', 'SKU', 'CJ Variant ID', 'Price Adj.', 'Action'].map((h) => (
                          <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {editingProduct.variants?.map((v) => (
                        <VariantRow key={v.id} variant={v} onDelete={() => deleteVariant(v.id)} onUpdate={(updates) => upsertVariant({ ...v, ...updates })} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Add variant */}
                <div className="flex gap-2 flex-wrap items-end">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Color</label>
                    <select value={newVariantColor} onChange={(e) => setNewVariantColor(e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs checkout-select bg-white">
                      <option value="">Select</option>
                      {COLORS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Size</label>
                    <select value={newVariantSize} onChange={(e) => setNewVariantSize(e.target.value)} className="border border-gray-200 px-2 py-1.5 text-xs checkout-select bg-white">
                      <option value="">Select</option>
                      {PRODUCT_SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Price Adj. ($)</label>
                    <input type="number" step="0.01" value={newVariantPriceAdj} onChange={(e) => setNewVariantPriceAdj(parseFloat(e.target.value) || 0)} className="border border-gray-200 px-2 py-1.5 text-xs w-24 focus:outline-none" placeholder="0.00" />
                  </div>
                  <button onClick={handleAddVariant} className="bg-[#0a0a0a] text-white px-3 py-1.5 text-xs flex items-center gap-1 hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            )}

            {/* Save */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button onClick={handleSaveProduct} className="flex items-center gap-2 bg-[#0a0a0a] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A96E] hover:text-[#0a0a0a] transition-colors">
                <Check size={14} /> {isNew ? 'Create Product' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditingProduct(null); setIsNew(false); }} className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gray-200 hover:border-[#0a0a0a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function VariantRow({ variant, onDelete, onUpdate }: { variant: ProductVariant; onDelete: () => void; onUpdate: (u: Partial<ProductVariant>) => void }) {
  const [cjId, setCjId] = useState(variant.cj_variant_id || '');
  return (
    <tr className="border-t border-gray-50">
      <td className="px-3 py-2">{variant.color}</td>
      <td className="px-3 py-2 font-bold">{variant.size}</td>
      <td className="px-3 py-2 font-mono text-gray-400">{variant.sku}</td>
      <td className="px-3 py-2">
        <input
          value={cjId}
          onChange={(e) => setCjId(e.target.value)}
          onBlur={() => onUpdate({ cj_variant_id: cjId })}
          className="border border-gray-100 px-2 py-1 text-xs w-28 focus:outline-none focus:border-gray-300"
          placeholder="CJ variant ID"
        />
      </td>
      <td className="px-3 py-2">{variant.price_adjustment > 0 ? `+$${variant.price_adjustment}` : variant.price_adjustment < 0 ? `-$${Math.abs(variant.price_adjustment)}` : '—'}</td>
      <td className="px-3 py-2">
        <button onClick={onDelete} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
      </td>
    </tr>
  );
}
