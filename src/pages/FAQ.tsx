import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FAQS = [
  { q: 'How long does shipping take?', a: 'Standard shipping to the US takes 3–7 business days. Orders over $75 ship free. Express options are available at checkout.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email. You can also track on our Order Tracking page using your order number and email.' },
  { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery on unworn, unwashed items with tags still attached. Visit our Returns page to start the process.' },
  { q: 'Do you offer exchanges?', a: 'We don\'t do direct exchanges at this time — the fastest way to get a different size or color is to return your item and place a new order.' },
  { q: 'How do I know which size to order?', a: 'Each product page includes a size guide with detailed measurements. If you\'re between sizes, check the product\'s fit notes — we specify whether it runs true to size, oversized, or slim.' },
  { q: 'Can I change or cancel my order?', a: 'We process orders quickly. If you need to change or cancel, contact us immediately at hello@linedegree.com. We\'ll do our best, but we can\'t guarantee changes once an order is in the fulfillment queue.' },
  { q: 'My order arrived damaged or incorrect — what do I do?', a: 'We\'re sorry to hear that. Email us at hello@linedegree.com with a photo of the issue within 48 hours of delivery and we\'ll sort it out immediately.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards through Paystack and Flutterwave. Apple Pay is available on supported Apple devices.' },
  { q: 'Is my payment information secure?', a: 'Yes. We use Paystack and Flutterwave for all transactions — both are PCI-DSS compliant. We never see or store your card details.' },
  { q: 'Do you ship internationally?', a: 'We currently ship to the United States. International shipping is coming soon.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-3">FAQ</h1>
        <p className="text-gray-500 text-sm mb-12">Answers to the things we get asked most.</p>

        <div className="space-y-0">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-gray-100">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
              >
                <span className="text-sm font-semibold text-[#0a0a0a] pr-4">{faq.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#F5F0E8] p-6">
          <p className="font-semibold mb-2">Still have a question?</p>
          <p className="text-sm text-gray-600 mb-4">We're here to help. Reach out and we'll get back to you within 24 hours.</p>
          <a href="/contact" className="btn-primary inline-block">CONTACT US</a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
