import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, RotateCcw, Truck, Shield } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGallery from '@/components/features/ProductGallery';
import ProductCard from '@/components/features/ProductCard';
import SizeGuideModal from '@/components/features/SizeGuideModal';
import { useProduct } from '@/hooks/useProducts';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import { PRODUCT_SIZES } from '@/constants';
import { toast } from 'sonner';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: allProducts } = useProducts('active');
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.filter((v) => v.active).map((v) => v.color).filter(Boolean))] as string[];
  }, [product?.variants]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return PRODUCT_SIZES;
    return product.variants
      .filter((v) => v.active && v.color === selectedColor)
      .map((v) => v.size)
      .filter(Boolean) as string[];
  }, [product?.variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize && v.active) || null;
  }, [product?.variants, selectedColor, selectedSize]);

  const finalPrice = product ? product.price + (selectedVariant?.price_adjustment || 0) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedColor) { toast.error('Please select a color'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedVariant) { toast.error('Selected combination is unavailable'); return; }

    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
    addItem({
      id: selectedVariant.id,
      product_id: product.id,
      product_name: product.name,
      variant_id: selectedVariant.id,
      color: selectedColor,
      size: selectedSize,
      sku: selectedVariant.sku || '',
      price: finalPrice,
      quantity,
      image_url: primaryImage?.url || '',
      cj_product_id: product.cj_product_id || '',
      cj_variant_id: selectedVariant.cj_variant_id || '',
    });
    toast.success(`${product.name} — ${selectedColor} / ${selectedSize} added to bag`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // cart opens automatically
  };

  const relatedProducts = allProducts?.filter((p) => p.id !== product?.id).slice(0, 4) || [];

  const AccordionSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-xs font-semibold tracking-[0.15em] uppercase">{title}</span>
        <ChevronDown size={14} className={`transition-transform ${expandedSection === id ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === id && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] shimmer" />
          <div className="space-y-4">
            <div className="h-6 w-3/4 shimmer" />
            <div className="h-4 w-1/4 shimmer" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="text-center py-24">
        <h1 className="font-display text-4xl mb-4">PRODUCT NOT FOUND</h1>
        <Link to="/shop" className="btn-primary">SHOP ALL</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
        <Link to="/" className="hover:text-[#0a0a0a]">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop" className="hover:text-[#0a0a0a]">Shop</Link>
        <ChevronRight size={10} />
        <span className="text-[#0a0a0a]">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images || []} productName={product.name} />

          {/* Product Info */}
          <div className="py-2">
            <h1 className="font-display text-4xl md:text-5xl text-[#0a0a0a] leading-tight mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold text-[#0a0a0a]">
                {formatCurrency(finalPrice)}
                {selectedVariant?.price_adjustment ? (
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    ({selectedVariant.price_adjustment > 0 ? '+' : ''}{formatCurrency(selectedVariant.price_adjustment)} for this option)
                  </span>
                ) : null}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compare_at_price)}</span>
              )}
              {product.compare_at_price && (
                <span className="text-xs font-bold bg-[#0a0a0a] text-white px-2 py-0.5">
                  SAVE {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </span>
              )}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                    Color: <span className="font-normal normal-case text-gray-500">{selectedColor || 'Select'}</span>
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                      className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                        selectedColor === color
                          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                  Size: <span className="font-normal normal-case text-gray-500">{selectedSize || 'Select'}</span>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs underline text-gray-400 hover:text-[#0a0a0a] transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {PRODUCT_SIZES.map((size) => {
                  const available = !selectedColor || availableSizes.includes(size);
                  return (
                    <button
                      key={size}
                      disabled={!available}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 text-xs font-semibold border transition-all ${
                        selectedSize === size
                          ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
                          : available
                          ? 'border-gray-200 hover:border-gray-400'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase block mb-2.5">Quantity</span>
              <div className="flex items-center border border-gray-200 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-sm">−</button>
                <span className="w-10 h-10 flex items-center justify-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-sm">+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-6">
              <button onClick={handleAddToCart} className="btn-primary w-full">
                ADD TO BAG
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  window.location.href = '/checkout';
                }}
                className="btn-outline w-full"
              >
                BUY NOW
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-t border-b border-gray-100">
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 leading-tight">Free shipping over $75</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <RotateCcw size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 leading-tight">30-day returns</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 leading-tight">Secure checkout</span>
              </div>
            </div>

            {/* Accordions */}
            <AccordionSection id="details" title="Product Details">
              <p className="mb-3">{product.description}</p>
              {product.material && <p><strong>Material:</strong> {product.material}</p>}
              {product.fit && <p><strong>Fit:</strong> {product.fit}</p>}
            </AccordionSection>
            <AccordionSection id="care" title="Care Instructions">
              <p>{product.care_instructions || 'Machine wash cold on gentle cycle. Hang to dry. Do not bleach. Iron on low if needed.'}</p>
            </AccordionSection>
            <AccordionSection id="shipping" title="Shipping">
              <p>{product.shipping_info || '3–7 business days to the US. Free on orders $75+'}</p>
            </AccordionSection>
            <AccordionSection id="returns" title="Returns">
              <p>{product.return_info || '30-day returns on unworn, unwashed items with tags attached. Contact us to initiate.'}</p>
            </AccordionSection>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-4xl text-[#0a0a0a] mb-8">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} productId={product.id} />
      <Footer />
    </div>
  );
}
