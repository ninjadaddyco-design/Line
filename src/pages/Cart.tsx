import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, Trash2, ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/features/ProductCard';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { data: products } = useProducts('active');
  const subtotal = getSubtotal();
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const toFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const crossSells = products?.filter((p) => !items.some((i) => i.product_id === p.id)).slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-8">YOUR BAG</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">Your bag is empty.</p>
            <Link to="/shop" className="btn-primary">SHOP THE COLLECTION</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping bar */}
              {!shippingFree && (
                <div className="bg-gray-50 p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Add <span className="font-bold text-[#0a0a0a]">{formatCurrency(toFreeShipping)}</span> more for free shipping
                  </p>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div className="h-1.5 bg-[#C9A96E] rounded-full transition-all" style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
              {shippingFree && (
                <div className="bg-[#C9A96E]/10 p-4">
                  <p className="text-sm font-semibold text-[#0a0a0a]">🎉 You've qualified for free shipping!</p>
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 border-b border-gray-100">
                  <Link to={`/product/${item.product_id}`} className="w-24 h-28 bg-gray-50 shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
                    <img
                      src={item.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80`}
                      alt={item.product_name}
                      className="w-full h-full object-cover object-top"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <Link to={`/product/${item.product_id}`} className="font-medium text-sm text-[#0a0a0a] hover:text-[#C9A96E] transition-colors leading-tight">
                        {item.product_name}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-2 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">{item.color} / {item.size}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"><Minus size={11} /></button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"><Plus size={11} /></button>
                      </div>
                      <span className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-gray-50 p-6 sticky top-24">
                <h2 className="font-semibold text-sm tracking-widest uppercase mb-5">Order Summary</h2>
                <div className="space-y-2.5 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>{shippingFree ? 'FREE' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-3 mt-3">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="btn-primary w-full text-center block">
                  CHECKOUT
                </Link>
                <Link to="/shop" className="block text-center text-xs text-gray-400 mt-3 hover:text-[#0a0a0a] transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cross sells */}
        {crossSells.length > 0 && items.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <h2 className="font-display text-3xl text-[#0a0a0a] mb-6">COMPLETE THE LOOK</h2>
            <div className="grid grid-cols-2 gap-4">
              {crossSells.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
