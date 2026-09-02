import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl text-[#0a0a0a] mb-2">TERMS OF SERVICE</h1>
        <p className="text-gray-400 text-xs mb-10">Last updated: September 2026</p>
        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing and using the LINE° website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.' },
            { title: '2. Products and Pricing', body: 'We reserve the right to modify product descriptions, pricing, and availability at any time. All prices are in USD. We are not responsible for typographical errors in pricing.' },
            { title: '3. Orders', body: 'Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order for reasons including product availability, errors in product description, or suspected fraud.' },
            { title: '4. Payment', body: 'Payment must be received before orders are processed. All payments are processed by third-party providers (Paystack, Flutterwave). We do not store payment card information.' },
            { title: '5. Shipping and Delivery', body: 'Delivery timeframes are estimates only. We are not liable for delays caused by the carrier, customs, or other events outside our control.' },
            { title: '6. Returns', body: 'Returns are subject to our Return Policy. We reserve the right to reject returns that do not meet our policy requirements.' },
            { title: '7. Intellectual Property', body: 'All content on this website — including text, images, and the LINE° brand — is our property and may not be reproduced without written permission.' },
            { title: '8. Limitation of Liability', body: 'LINE° is not liable for indirect, incidental, or consequential damages arising from use of our products or website. Our maximum liability is limited to the value of your order.' },
            { title: '9. Governing Law', body: 'These terms are governed by the laws of the United States.' },
            { title: '10. Contact', body: 'For terms questions: hello@linedegree.com' },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
