import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const { data: content } = useQuery({
    queryKey: ['site-content', 'newsletter'],
    queryFn: async () => {
      const { data } = await supabase.from('site_content').select('content').eq('section', 'newsletter').single();
      return data?.content || {};
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email address'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setJoined(true);
    setLoading(false);
    toast.success('Welcome to LINE°! Check your inbox.');
  };

  return (
    <section className="bg-[#0a0a0a] text-white py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="font-display text-5xl md:text-6xl text-[#C9A96E] mb-3 leading-none">
          {content?.headline || 'JOIN THE EDIT'}
        </h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          {content?.subheadline || 'New drops. Styling notes. First access. No spam — we promise.'}
        </p>
        {joined ? (
          <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] py-4 px-6 text-sm font-medium tracking-wide">
            You're in. Welcome to the edit.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={content?.placeholder || 'Your email address'}
              className="flex-1 bg-transparent border border-gray-700 text-white placeholder-gray-500 px-4 py-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#C9A96E] text-[#0a0a0a] px-7 py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors disabled:opacity-60"
            >
              {loading ? '…' : (content?.button_text || 'JOIN')}
            </button>
          </form>
        )}
        <p className="text-gray-600 text-xs mt-4">Unsubscribe at any time. Your privacy is respected.</p>
      </div>
    </section>
  );
}
