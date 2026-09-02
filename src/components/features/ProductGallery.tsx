import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const placeholderImages = sortedImages.length > 0 ? sortedImages : [
    { id: '1', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', alt_text: productName, is_primary: true, sort_order: 0, product_id: '', color_variant: null, created_at: '' },
    { id: '2', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', alt_text: productName, is_primary: false, sort_order: 1, product_id: '', color_variant: null, created_at: '' },
  ];

  const current = placeholderImages[activeIndex] || placeholderImages[0];

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? placeholderImages.length - 1 : i - 1));
    setZoomed(false);
  }, [placeholderImages.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === placeholderImages.length - 1 ? 0 : i + 1));
    setZoomed(false);
  }, [placeholderImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* Thumbnails - side on desktop, bottom on mobile */}
      <div className="hidden md:flex flex-col gap-2 w-[72px]">
        {placeholderImages.map((img, i) => (
          <button
            key={img.id}
            onClick={() => { setActiveIndex(i); setZoomed(false); }}
            className={`w-full aspect-[3/4] overflow-hidden transition-all ${
              i === activeIndex ? 'ring-2 ring-[#0a0a0a]' : 'ring-1 ring-gray-200 hover:ring-gray-400'
            }`}
          >
            <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover object-top" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1">
        <div
          ref={imageRef}
          className="relative aspect-[3/4] bg-gray-50 overflow-hidden gallery-container cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onClick={() => setZoomed((z) => !z)}
        >
          <img
            src={current.url}
            alt={current.alt_text || productName}
            className="w-full h-full object-cover object-top select-none transition-transform duration-200"
            style={zoomed ? {
              transform: 'scale(2)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              cursor: 'zoom-out',
            } : {}}
            draggable={false}
          />

          {/* Nav arrows */}
          {placeholderImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 shadow-sm transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 shadow-sm transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Zoom hint */}
          {!zoomed && (
            <div className="absolute bottom-3 right-3 bg-white/70 p-1.5">
              <ZoomIn size={14} className="text-gray-500" />
            </div>
          )}

          {/* Dot indicators */}
          {placeholderImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {placeholderImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-[#0a0a0a] w-4' : 'bg-gray-400'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile thumbnails */}
        <div className="flex gap-2 mt-2 md:hidden overflow-x-auto pb-1">
          {placeholderImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`w-14 h-[70px] shrink-0 overflow-hidden transition-all ${
                i === activeIndex ? 'ring-2 ring-[#0a0a0a]' : 'ring-1 ring-gray-200'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
