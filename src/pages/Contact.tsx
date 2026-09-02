import { useState } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
  };

  const inputClass = 'w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-[#0a0a0a] transition-colors';
  const labelClass = 'block text-xs font-semibold tracking-wider uppercase text-gray-500 mb-1.5';

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-4">GET IN TOUCH</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Questions, feedback, styling help — we're here. We aim to respond within 24 hours Monday through Friday.
            </p>
            <div className="space-y-5">
              {[
                { label: 'Email', value: 'hello@linedegree.com', href: 'mailto:hello@linedegree.com' },
                { label: 'Orders & Returns', value: 'Use our self-serve forms', href: '/account' },
                { label: 'Response Time', value: 'Within 24 hours', href: null },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-semibold tracking-wider uppercase text-gray-400 mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium hover:text-[#C9A96E] transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            {sent ? (
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 p-8 text-center">
                <p className="font-display text-3xl text-[#0a0a0a] mb-2">MESSAGE SENT</p>
                <p className="text-sm text-gray-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Your Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Subject</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${inputClass} checkout-select bg-white`}>
                    <option value="">Select a topic</option>
                    <option>Order Question</option>
                    <option>Return / Refund</option>
                    <option>Product Question</option>
                    <option>Sizing Help</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} resize-none`} rows={5} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Sending…' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
