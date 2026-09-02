import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const toFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={closeCart} />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="font-semibold text-sm tracking-widest uppercase">Your Bag</span>
            {items.length > 0 && (
              <span className="bg-[#0a0a0a] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 hover:text-[#C9A96E] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping bar */}
        {!shippingFree && subtotal > 0 && (
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-600 mb-1.5">
              Add <span className="font-bold text-[#0a0a0a]">{formatCurrency(toFreeShipping)}</span> more for free shipping
            </p>
            <div className="h-1 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-[#C9A96E] rounded-full transition-all duration-500"
                style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {shippingFree && (
          <div className="bg-[#C9A96E]/10 px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-[#0a0a0a] tracking-wide">🎉 You've unlocked FREE shipping!</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <ShoppingBag size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400 text-center">Your bag is empty.<br />Add something beautiful.</p>
              <button onClick={closeCart} className="btn-primary text-sm">SHOP NOW</button>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-20 h-24 bg-gray-50 shrink-0 overflow-hidden">
                    <img
                      src={item.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80`}
                      alt={item.product_name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#0a0a0a] leading-tight mb-1">{item.product_name}</h4>
                    <p className="text-xs text-gray-400 mb-2">{item.color} / {item.size}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-gray-600 transition-colors self-start mt-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">{shippingFree ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center block mt-2"
            >
              CHECKOUT — {formatCurrency(total)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
