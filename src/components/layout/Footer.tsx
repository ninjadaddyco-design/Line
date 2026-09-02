import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Instagram, Music2 } from 'lucide-react';

const platformIcons: Record<string, JSX.Element> = {
  instagram: <Instagram size={18} />,
  tiktok: <Music2 size={18} />,
  pinterest: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

export default function Footer() {
  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data } = await supabase.from('social_links').select('*').eq('active', true);
      return data || [];
    },
    staleTime: 60000,
  });

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="brand-logo text-3xl text-white mb-4">
              LIN<span className="relative inline-block">E<sup className="text-[10px] absolute -top-1 -right-1">°</sup></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Intentional pieces for the woman who moves differently.
            </p>
            <div className="flex gap-4">
              {socialLinks?.map((link: { platform: string; url: string }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#C9A96E] transition-colors p-1"
                >
                  {platformIcons[link.platform] || <span className="text-xs uppercase">{link.platform}</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-400 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'New Arrivals', href: '/shop?filter=new' },
                { label: 'Dresses', href: '/shop?filter=dresses' },
                { label: 'Trousers', href: '/shop?filter=trousers' },
                { label: 'Tops & Shirts', href: '/shop?filter=tops' },
                { label: 'All Products', href: '/shop' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-400 mb-5">Help</h4>
            <ul className="space-y-3">
              {[
                { label: 'Track My Order', href: '/track' },
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Returns & Refunds', href: '/returns' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-400 mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About LINE°', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Payment logos */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3 tracking-wider uppercase">We Accept</p>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-white text-[#0a0a0a] text-[9px] font-black px-2 py-1 rounded tracking-wider">PAYSTACK</span>
                <span className="bg-[#F5A623] text-white text-[9px] font-black px-2 py-1 rounded tracking-wider">FLUTTERWAVE</span>
                <span className="bg-black text-white text-[9px] font-medium px-2 py-1 rounded border border-gray-600 flex items-center gap-1">
                  <svg width="10" height="12" viewBox="0 0 16 20" fill="white"><path d="M13.14 10.48c-.03-2.98 2.44-4.43 2.56-4.51-1.4-2.04-3.57-2.32-4.34-2.35-1.84-.19-3.6 1.08-4.53 1.08-.93 0-2.36-1.05-3.89-1.03C1.19 3.7-.04 4.96-.04 7.25c0 4.5 3.19 12.4 4.54 16.44.72 2.05 1.57 4.35 2.69 4.26 1.09-.1 1.5-.7 2.81-.7 1.31 0 1.69.7 2.84.68 1.17-.02 1.91-2.08 2.62-4.13.83-2.37 1.17-4.7 1.19-4.82-.03-.01-2.49-.95-2.51-3.5z"/></svg>
                  Pay
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">© 2026 LINE°. All rights reserved.</p>
          <p className="text-xs text-gray-500">Made for women who move differently.</p>
        </div>
      </div>
    </footer>
  );
}
