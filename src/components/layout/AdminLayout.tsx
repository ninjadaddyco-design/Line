import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck, RotateCcw,
  Factory, CreditCard, FileText, BarChart3, Settings, LogOut, Menu, X, Music2
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Fulfillment', href: '/admin/fulfillment', icon: Truck },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { label: 'Suppliers', href: '/admin/suppliers', icon: Factory },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'TikTok', href: '/admin/tiktok', icon: Music2 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <Link to="/admin" className="brand-logo text-xl text-white">
          LIN<span className="relative inline-block">E<sup className="text-[8px] absolute -top-1 -right-1">°</sup></span>
          <span className="ml-2 text-xs text-gray-400 font-sans font-normal tracking-widest uppercase">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm mb-0.5 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-800 text-[#C9A96E] font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 w-full text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1"
        >
          ← View Store
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            className="lg:hidden p-1 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-gray-900 text-base">{title}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
