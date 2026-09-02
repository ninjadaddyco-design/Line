import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product, ProductImage, ProductVariant } from '@/types';
import { toast } from 'sonner';

export function useProducts(status?: string) {
  return useQuery({
    queryKey: ['products', status],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .order('sort_order', { ascending: true });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['product-by-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useAllAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product> & { id?: string }) => {
      if (product.id) {
        const { data, error } = await supabase.from('products').update({ ...product, updated_at: new Date().toISOString() }).eq('id', product.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('products').insert(product).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (image: Omit<ProductImage, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('product_images').insert(image).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['product-by-id', vars.product_id] });
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_images').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useUpsertVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (variant: Partial<ProductVariant> & { product_id: string }) => {
      if (variant.id) {
        const { data, error } = await supabase.from('product_variants').update(variant).eq('id', variant.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('product_variants').insert(variant).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
