import { useState } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Returns() {
  const [form, setForm] = useState({ order_number: '', email: '', reason: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.order_number || !form.email || !form.reason) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    const { error } = await supabase.from('returns').insert({
      customer_email: form.email,
      reason: `${form.reason}: ${form.details}`,
      status: 'submitted',
    });
    setLoading(false);
    if (error) { toast.error('Submission failed. Please email us directly.'); return; }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-3">RETURNS & REFUNDS</h1>

        <div className="space-y-6 mb-12">
          <div className="bg-[#F5F0E8] p-5">
            <p className="font-semibold text-sm mb-1">30-Day Return Window</p>
            <p className="text-sm text-gray-600">Returns are accepted within 30 days of delivery on unworn, unwashed items with original tags attached.</p>
          </div>

          {[
            { title: 'Eligible for Return', items: ['Unworn items in original condition', 'Items with tags still attached', 'Items returned within 30 days'] },
            { title: 'Not Eligible', items: ['Worn or washed items', 'Items without tags', 'Sale/final sale items', 'Items returned after 30 days'] },
            { title: 'Refund Timeline', items: ['Refunds processed within 5–7 business days of receiving your return', 'Refund issued to original payment method', 'You\'ll receive an email confirmation when your refund is issued'] },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-semibold text-base mb-3">{section.title}</h2>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Return form */}
        <div className="border border-gray-100 p-6">
          <h2 className="font-semibold text-base mb-5">Start a Return</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              <p className="font-semibold mb-1">Return request submitted!</p>
              <p>We'll review your request and get back to you within 1 business day with return instructions.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Order Number *</label>
                  <input value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a]" placeholder="LN-XXXXXX" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a]" placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Reason *</label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] checkout-select bg-white" required>
                  <option value="">Select a reason</option>
                  <option>Wrong size</option>
                  <option>Item not as described</option>
                  <option>Changed my mind</option>
                  <option>Received wrong item</option>
                  <option>Damaged / defective</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Additional Details</label>
                <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#0a0a0a] resize-none" rows={3} placeholder="Tell us more..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Submitting…' : 'SUBMIT RETURN REQUEST'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
