import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
  const secondaryImage = product.images?.find((i) => !i.is_primary && i !== primaryImage) || product.images?.[1];
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const addItem = useCartStore((s) => s.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      toast.info('Select options on the product page.');
      return;
    }
    addItem({
      id: firstVariant.id,
      product_id: product.id,
      product_name: product.name,
      variant_id: firstVariant.id,
      color: firstVariant.color || '',
      size: firstVariant.size || '',
      sku: firstVariant.sku || '',
      price: product.price + (firstVariant.price_adjustment || 0),
      quantity: 1,
      image_url: primaryImage?.url || '',
      cj_product_id: product.cj_product_id || '',
      cj_variant_id: firstVariant.cj_variant_id || '',
    });
    toast.success(`${product.name} added to bag`);
  };

  const imageUrl = primaryImage?.url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&random=${product.id}`;
  const hoverImageUrl = secondaryImage?.url || primaryImage?.url || imageUrl;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
        <img
          src={imageUrl}
          alt={primaryImage?.alt_text || product.name}
          className="w-full h-full object-cover object-top transition-opacity duration-500 group-hover:opacity-0 absolute inset-0"
          loading="lazy"
        />
        <img
          src={hoverImageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount >= 10 && (
            <span className="bg-[#0a0a0a] text-white text-[10px] font-bold px-2 py-1 tracking-wider">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-[#C9A96E] text-[#0a0a0a] text-[10px] font-bold px-2 py-1 tracking-wider">
              FEATURED
            </span>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] text-white py-3 text-xs font-semibold tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          QUICK ADD
        </button>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight mb-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#0a0a0a]">{formatCurrency(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compare_at_price)}</span>
          )}
        </div>
        {/* Color swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[...new Set(product.variants.map((v) => v.color).filter(Boolean))].slice(0, 5).map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-full border border-gray-200"
                style={{ backgroundColor: getColorHex(color!) }}
                title={color!}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    black: '#0a0a0a', white: '#ffffff', cream: '#F5F0E8', camel: '#C19A6B',
    ivory: '#FFFFF0', chocolate: '#3D1C02', stone: '#9E9082', sage: '#8FAF7C',
    charcoal: '#36454F', navy: '#0A1931', nude: '#E8C9A0', brown: '#6B3A2A',
  };
  return map[color.toLowerCase()] || '#888';
}
