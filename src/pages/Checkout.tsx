import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import PaymentSection from '@/components/features/PaymentSection';
import { US_STATES } from '@/constants';
import { useCartStore } from '@/stores/cartStore';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants';

const schema = z.object({
  email: z.string().email('Valid email required'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  phone: z.string().min(7, 'Valid phone required'),
  country: z.string().default('US'),
  address_line1: z.string().min(5, 'Address required'),
  address_line2: z.string().optional().default(''),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zip: z.string().min(5, 'ZIP code required'),
});

type FormData = z.infer<typeof schema>;

const inputClass = 'w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors bg-white';
const errorClass = 'text-red-500 text-xs mt-1';
const labelClass = 'block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5';

export default function Checkout() {
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;

  const { register, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const formData = watch();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <AnnouncementBar />
        <Header />
        <div className="text-center py-24">
          <h1 className="font-display text-4xl mb-4">YOUR BAG IS EMPTY</h1>
          <Link to="/shop" className="btn-primary">SHOP NOW</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Link to="/cart" className="text-xs text-gray-400 hover:text-[#0a0a0a] transition-colors">← Back to Bag</Link>
          <h1 className="font-display text-4xl md:text-5xl text-[#0a0a0a] mt-2">CHECKOUT</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 pb-2 border-b border-gray-100">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input {...register('email')} type="email" className={inputClass} placeholder="your@email.com" />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input {...register('first_name')} className={inputClass} placeholder="Jane" />
                    {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input {...register('last_name')} className={inputClass} placeholder="Doe" />
                    {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input {...register('phone')} type="tel" className={inputClass} placeholder="+1 (555) 000-0000" />
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 pb-2 border-b border-gray-100">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Country</label>
                  <select {...register('country')} className={`${inputClass} checkout-select`}>
                    <option value="US">United States</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Address *</label>
                  <input {...register('address_line1')} className={inputClass} placeholder="123 Main Street" />
                  {errors.address_line1 && <p className={errorClass}>{errors.address_line1.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Apt / Suite / Unit</label>
                  <input {...register('address_line2')} className={inputClass} placeholder="Optional" />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input {...register('city')} className={inputClass} placeholder="New York" />
                  {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>State *</label>
                    <select {...register('state')} className={`${inputClass} checkout-select`}>
                      <option value="">Select state</option>
                      {US_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {errors.state && <p className={errorClass}>{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code *</label>
                    <input {...register('zip')} className={inputClass} placeholder="10001" />
                    {errors.zip && <p className={errorClass}>{errors.zip.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-5 pb-2 border-b border-gray-100">Payment</h2>
              <PaymentSection
                formData={{
                  email: formData.email || '',
                  first_name: formData.first_name || '',
                  last_name: formData.last_name || '',
                  phone: formData.phone || '',
                  country: formData.country || 'US',
                  address_line1: formData.address_line1 || '',
                  address_line2: formData.address_line2 || '',
                  city: formData.city || '',
                  state: formData.state || '',
                  zip: formData.zip || '',
                }}
                isValid={isValid}
              />
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-5 sticky top-24">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-16 shrink-0 bg-white overflow-hidden">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&q=80'} alt={item.product_name} className="w-full h-full object-cover object-top" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0a0a0a] text-white text-[9px] rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">{item.color} / {item.size}</p>
                    </div>
                    <span className="text-xs font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
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
                  <span>{formatCurrency(subtotal + shipping)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
