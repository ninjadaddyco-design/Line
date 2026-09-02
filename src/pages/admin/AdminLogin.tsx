import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      navigate('/admin');
    } else {
      toast.error('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="brand-logo text-4xl text-white mb-2">
            LIN<span className="relative inline-block">E<sup className="text-sm absolute -top-1 -right-1">°</sup></span>
          </div>
          <p className="text-gray-500 text-xs tracking-widest uppercase">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors"
              placeholder="line@gmail.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-gray-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors pr-12"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A96E] text-[#0a0a0a] py-4 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 hover:bg-white transition-colors mt-2"
          >
            {loading ? 'Signing in…' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-8">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
