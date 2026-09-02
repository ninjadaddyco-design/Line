import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function AnnouncementBar() {
  const { data: settings } = useQuery({
    queryKey: ['announcement'],
    queryFn: async () => {
      const { data } = await supabase.from('admin_settings').select('value').eq('key', 'announcement_text').single();
      return data?.value || 'FREE SHIPPING ON ORDERS $75+ • NEW ARRIVALS DROPPING • SHOP THE COLLECTION NOW';
    },
    staleTime: 60000,
  });

  const text = settings || 'FREE SHIPPING ON ORDERS $75+ • NEW ARRIVALS DROPPING • SHOP THE COLLECTION NOW';
  const repeated = Array(6).fill(text + ' • ').join('');

  return (
    <div className="bg-[#0a0a0a] text-white py-2.5 overflow-hidden relative">
      <div className="flex whitespace-nowrap marquee-track">
        <span className="text-xs tracking-[0.18em] font-medium uppercase px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {repeated}
        </span>
        <span className="text-xs tracking-[0.18em] font-medium uppercase px-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {repeated}
        </span>
      </div>
    </div>
  );
}
