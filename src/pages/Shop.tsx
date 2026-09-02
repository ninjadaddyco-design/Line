import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/features/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const searchQuery = searchParams.get('search') || '';

  const { data: products, isLoading } = useQuery({
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

  const filtered = useMemo(() => {
    let list = products || [];
    if (searchQuery) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (sort) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'newest': return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default: return list;
    }
  }, [products, sort, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      {/* Page header */}
      <div className="bg-[#F5F0E8] py-12 px-4 text-center">
        <h1 className="font-display text-5xl md:text-6xl text-[#0a0a0a]">
          {searchQuery ? `SEARCH: "${searchQuery.toUpperCase()}"` : 'THE COLLECTION'}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gray-600 hover:text-[#0a0a0a] transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filter
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-semibold border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-[#0a0a0a] cursor-pointer checkout-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] shimmer" />
                <div className="h-4 w-3/4 shimmer" />
                <div className="h-4 w-1/4 shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">No pieces found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
            {searchQuery && (
              <a href="/shop" className="text-xs font-semibold tracking-wider uppercase underline">View All</a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
