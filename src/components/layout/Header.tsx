import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import CartSidebar from '@/components/features/CartSidebar';

const navLinks = [
  { label: 'New In', href: '/shop?filter=new' },
  { label: 'Dresses', href: '/shop?filter=dresses' },
  { label: 'Trousers', href: '/shop?filter=trousers' },
  { label: 'Tops', href: '/shop?filter=tops' },
  { label: 'Shop All', href: '/shop' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems, toggleCart, isOpen } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <button
              className="md:hidden p-2 -ml-2 text-[#0a0a0a]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop nav left */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs font-semibold tracking-[0.12em] uppercase text-[#0a0a0a] hover:text-[#C9A96E] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 brand-logo text-2xl md:text-3xl text-[#0a0a0a] hover:text-[#C9A96E] transition-colors">
              LIN<span className="relative inline-block">E<sup className="text-[10px] md:text-xs absolute -top-1 -right-1">°</sup></span>
            </Link>

            {/* Desktop nav right */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs font-semibold tracking-[0.12em] uppercase text-[#0a0a0a] hover:text-[#C9A96E] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-[#0a0a0a] hover:text-[#C9A96E] transition-colors"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
              <Link to="/account" className="p-1.5 text-[#0a0a0a] hover:text-[#C9A96E] transition-colors hidden md:block" aria-label="Account">
                <User size={19} />
              </Link>
              <button
                onClick={toggleCart}
                className="p-1.5 text-[#0a0a0a] hover:text-[#C9A96E] transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0a0a0a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="border-t border-gray-100 py-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces..."
                  className="flex-1 text-sm border border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#0a0a0a] transition-colors"
                  autoFocus
                />
                <button type="submit" className="bg-[#0a0a0a] text-white px-5 py-2.5 text-xs font-semibold tracking-widest uppercase">
                  SEARCH
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-3 text-sm font-semibold tracking-[0.12em] uppercase text-[#0a0a0a] border-b border-gray-100 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/account" className="block py-3 text-sm font-semibold tracking-[0.12em] uppercase text-[#0a0a0a]">
              My Account
            </Link>
          </div>
        )}
      </header>

      <CartSidebar />
    </>
  );
}
