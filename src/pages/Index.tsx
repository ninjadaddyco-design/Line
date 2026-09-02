import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/features/ProductCard';
import NewsletterSection from '@/components/features/NewsletterSection';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export default function Index() {
  const { data: products } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: siteContent } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data } = await supabase.from('site_content').select('*');
      const content: Record<string, Record<string, string>> = {};
      data?.forEach((row: { section: string; content: Record<string, string> }) => { content[row.section] = row.content; });
      return content;
    },
    staleTime: 30000,
  });

  const hero = siteContent?.hero || {};
  const editorial = siteContent?.editorial || {};
  const brandStory = siteContent?.brand_story || {};
  const shopTheLook = siteContent?.shop_the_look || {};
  const social = siteContent?.social_section || {};

  const featuredProducts = products?.filter((p) => p.featured) || products || [];
  const allProducts = products || [];

  const defaultHeroBg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80';
  const defaultHeroSecondary = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80';

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      {/* Hero */}
      <section className="relative min-h-[85vh] md:min-h-screen flex overflow-hidden bg-[#0a0a0a]">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={hero.bg_image || defaultHeroBg}
            alt="Line° Campaign"
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-end md:items-center pb-16 md:pb-0 pt-16">
          <div className="max-w-xl">
            <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-4">
              SS 26 COLLECTION
            </p>
            <h1 className="font-display text-7xl sm:text-8xl md:text-[120px] text-white leading-none mb-6 drop-shadow-2xl">
              {hero.headline || 'WEAR THE EDIT.'}
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-8 font-light leading-relaxed max-w-sm">
              {hero.subheadline || 'New silhouettes. Intentional pieces. Made to move.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={hero.cta_link || '/shop'} className="btn-primary inline-flex items-center gap-2">
                {hero.cta_text || 'SHOP NOW'}
                <ArrowRight size={14} />
              </Link>
              <Link to="/about" className="border border-white text-white font-semibold tracking-widest text-sm uppercase px-8 py-4 hover:bg-white hover:text-[#0a0a0a] transition-all duration-200 inline-block text-center">
                OUR STORY
              </Link>
            </div>
          </div>

          {/* Secondary image */}
          <div className="hidden lg:block absolute right-16 bottom-0 top-0 w-72">
            <img
              src={hero.secondary_image || defaultHeroSecondary}
              alt="Campaign"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-4xl md:text-5xl text-[#0a0a0a]">
              JUST DROPPED
            </h2>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 hover:text-[#0a0a0a] transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop" className="btn-outline inline-flex items-center gap-2">
              SHOP ALL <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Editorial Banner */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <img
          src={editorial.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80'}
          alt="Editorial"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/45 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-lg">
              <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-4">
                {editorial.headline || 'THE NEW WAY TO DRESS'}
              </h2>
              <p className="text-white/75 text-sm md:text-base mb-7 leading-relaxed">
                {editorial.subheadline || 'Wardrobe essentials rewritten for the woman who moves differently.'}
              </p>
              <Link to={editorial.cta_link || '/shop'} className="bg-white text-[#0a0a0a] font-semibold tracking-widest text-sm uppercase px-8 py-4 hover:bg-[#C9A96E] transition-colors inline-block">
                {editorial.cta_text || 'EXPLORE THE COLLECTION'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      {allProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-4xl md:text-5xl text-[#0a0a0a]">THE COLLECTION</h2>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 hover:text-[#0a0a0a] transition-colors">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Shop the Look */}
      <section className="bg-[#F5F0E8] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src={shopTheLook.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80'}
              alt="Shop the Look"
              className="w-full aspect-[4/5] object-cover object-top"
            />
          </div>
          <div className="md:pl-8">
            <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-3">Styling</p>
            <h2 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-5 leading-none">
              {shopTheLook.headline || 'BUILD THE LOOK'}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              {shopTheLook.subheadline || 'Start with one piece. Build a whole energy.'}
            </p>
            {allProducts.slice(0, 2).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="flex items-center gap-3 py-3 border-b border-gray-200 hover:border-[#0a0a0a] transition-colors group"
              >
                <div className="w-12 h-14 bg-gray-100 shrink-0 overflow-hidden">
                  <img
                    src={product.images?.find((i) => i.is_primary)?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#0a0a0a] transition-colors" />
              </Link>
            ))}
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2 mt-7">
              SHOP THE LOOK <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-3">About</p>
            <h2 className="font-display text-5xl md:text-6xl text-[#0a0a0a] mb-6 leading-none">
              {brandStory.headline || 'THIS IS LINE°'}
            </h2>
            {(brandStory.body || '').split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-gray-600 text-base leading-relaxed mb-4">{para}</p>
            ))}
            <Link to="/about" className="btn-outline inline-flex items-center gap-2 mt-2">
              LEARN MORE <ArrowRight size={14} />
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={brandStory.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80'}
              alt="Brand Story"
              className="w-full aspect-[3/4] object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Social/TikTok */}
      <section className="bg-[#0a0a0a] text-white py-14 px-4 text-center">
        <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase font-semibold mb-3">Community</p>
        <h2 className="font-display text-4xl md:text-5xl mb-3">
          {social.headline || 'TAG US @LINEDEGREE'}
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          {social.subheadline || 'Show us how you style your Line° pieces on TikTok and Instagram.'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 max-w-4xl mx-auto">
          {[
            'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&q=80',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80',
            'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&q=80',
            'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=300&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
          ].map((img, i) => (
            <div key={i} className="aspect-square overflow-hidden zoom-container">
              <img src={img} alt="Community" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
