import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Shipping() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-10">SHIPPING POLICY</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">Processing Time</h2>
            <p>Orders are processed within 1–3 business days (Monday through Friday, excluding public holidays). You will receive a confirmation email with tracking once your order ships.</p>
          </section>
          <section>
            <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">Delivery Times</h2>
            <div className="border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-xs tracking-wider uppercase">Method</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-xs tracking-wider uppercase">Estimated Time</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-xs tracking-wider uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100"><td className="px-4 py-3">Standard</td><td className="px-4 py-3">3–7 business days</td><td className="px-4 py-3">$7.99</td></tr>
                  <tr className="border-t border-gray-100 bg-[#C9A96E]/5"><td className="px-4 py-3 font-medium">Free Shipping</td><td className="px-4 py-3">3–7 business days</td><td className="px-4 py-3 font-semibold text-green-600">FREE on orders $75+</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">Tracking Your Order</h2>
            <p>Once your order has shipped, you will receive an email with your tracking number and carrier information. Use our <a href="/track" className="underline hover:text-[#C9A96E]">Order Tracking</a> page to follow your delivery in real time.</p>
          </section>
          <section>
            <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">Shipping Regions</h2>
            <p>We currently ship to all 50 US states and Washington D.C. International shipping is not available at this time but is coming soon.</p>
          </section>
          <section>
            <h2 className="font-semibold text-[#0a0a0a] text-base mb-2">Lost or Delayed Packages</h2>
            <p>If your package is significantly delayed or appears to be lost, please contact us at <a href="mailto:hello@linedegree.com" className="underline">hello@linedegree.com</a>. We will work with the carrier to resolve the issue as quickly as possible.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
