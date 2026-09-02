import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsletterSection from '@/components/features/NewsletterSection';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80" alt="About LINE°" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-[#0a0a0a]/50 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <h1 className="font-display text-6xl md:text-8xl text-white">THIS IS<br />LINE°</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div>
          <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-4">Our Story</p>
          <p className="text-gray-700 text-lg leading-relaxed mb-5">
            We started LINE° with one question: why does getting dressed still feel like work?
          </p>
          <p className="text-gray-600 leading-relaxed mb-5">
            LINE° exists to answer that. Each piece is designed to carry you — from morning to midnight, from the desk to wherever the night goes. Clean lines. Considered fits. No noise.
          </p>
          <p className="text-gray-600 leading-relaxed">
            The degree in our name is intentional. It is the shift. The slight elevation. The difference between fine and right.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#F5F0E8] p-8">
            <h3 className="font-display text-3xl text-[#0a0a0a] mb-3">THE PIECES</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Curated, not cluttered. Each piece earns its place. We start with silhouette, then fabric, then finish. Nothing ships until we'd wear it ourselves.</p>
          </div>
          <div className="bg-[#0a0a0a] p-8">
            <h3 className="font-display text-3xl text-white mb-3">THE CUSTOMER</h3>
            <p className="text-sm text-gray-400 leading-relaxed">She moves fast. She knows what she wants. She doesn't have time for things that don't work. We design for her.</p>
          </div>
        </div>

        <div>
          <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-4">Our Promise</p>
          <div className="space-y-4">
            {[
              { title: 'Intentional Design', body: 'Every silhouette is considered. Every detail has a reason.' },
              { title: 'Quality Materials', body: 'We source fabrics that move with you and last beyond the season.' },
              { title: 'Honest Sizing', body: 'Real measurements. Real fits. No surprises when the package arrives.' },
              { title: 'No Noise', body: 'We don\'t do fake urgency, fake reviews, or fake sales. Just real clothes.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 py-4 border-b border-gray-100">
                <div className="w-1 bg-[#C9A96E] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
