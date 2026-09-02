import { X } from 'lucide-react';
import { SIZE_CHART } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
}

export default function SizeGuideModal({ isOpen, onClose, productId }: SizeGuideModalProps) {
  const { data: sizeGuide } = useQuery({
    queryKey: ['size-guide', productId],
    queryFn: async () => {
      const { data } = await supabase
        .from('size_guide_images')
        .select('*')
        .or(`product_id.eq.${productId},is_global.eq.true`)
        .order('is_global', { ascending: true })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!productId && isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-sm tracking-widest uppercase">Size Guide</h2>
          <button onClick={onClose} className="p-1.5 hover:text-[#C9A96E] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* Fit photo */}
          {sizeGuide?.fit_photo_url && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-3">How It Fits</h3>
              <img src={sizeGuide.fit_photo_url} alt="Fit photo" className="w-full max-h-64 object-cover object-top" />
            </div>
          )}

          {/* Size chart image */}
          {sizeGuide?.size_chart_url && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-3">Size Chart</h3>
              <img src={sizeGuide.size_chart_url} alt="Size chart" className="w-full" />
            </div>
          )}

          {/* Measurement table */}
          <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-3">Measurements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 pr-4 font-semibold text-xs tracking-wider">SIZE</th>
                  <th className="text-left py-2.5 pr-4 font-semibold text-xs tracking-wider">BUST</th>
                  <th className="text-left py-2.5 pr-4 font-semibold text-xs tracking-wider">WAIST</th>
                  <th className="text-left py-2.5 pr-4 font-semibold text-xs tracking-wider">HIPS</th>
                  <th className="text-left py-2.5 font-semibold text-xs tracking-wider">US SIZE</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row, i) => (
                  <tr key={row.size} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-2.5 pr-4 font-bold">{row.size}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{row.bust}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{row.waist}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{row.hips}</td>
                    <td className="py-2.5 text-gray-600">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-4 bg-gray-50 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold mb-1">How to measure</p>
            <p><strong>Bust:</strong> Measure around the fullest part of your chest.</p>
            <p><strong>Waist:</strong> Measure around your natural waistline (smallest point).</p>
            <p><strong>Hips:</strong> Measure around the fullest part of your hips.</p>
            <p className="mt-2">If between sizes, we recommend sizing up for a more relaxed fit or sizing down for a closer fit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
