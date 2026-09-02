import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl text-[#0a0a0a] mb-2">PRIVACY POLICY</h1>
        <p className="text-gray-400 text-xs mb-10">Last updated: September 2026</p>
        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          {[
            { title: '1. Information We Collect', body: 'We collect information you provide directly to us, such as when you place an order (name, email, shipping address, phone number) or contact us. We also collect order history and browsing data through standard web analytics.' },
            { title: '2. How We Use Your Information', body: 'We use your information to process and fulfill orders, send order confirmations and shipping updates, respond to your questions, and improve our store. We do not sell your personal information.' },
            { title: '3. Payment Security', body: 'All payment processing is handled by Paystack and Flutterwave. We never see or store your card details. Both providers are PCI-DSS compliant and use industry-standard encryption.' },
            { title: '4. Data Sharing', body: 'We share your shipping information with our fulfillment partner (CJ Dropshipping) to process and ship your orders. We do not share your information with any other third parties for marketing purposes.' },
            { title: '5. Cookies', body: 'We use cookies to maintain your shopping cart and for basic analytics. No tracking cookies are used for advertising purposes.' },
            { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal information. To make a request, contact us at hello@linedegree.com.' },
            { title: '7. Contact', body: 'For privacy questions: hello@linedegree.com' },
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
