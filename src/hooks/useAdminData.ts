import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AdminSettings, SiteContent, SocialLink, Supplier, Customer } from '@/types';
import { toast } from 'sonner';

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_settings').select('*');
      if (error) throw error;
      const settings: AdminSettings = {};
      data?.forEach((row: { key: string; value: string }) => { settings[row.key] = row.value || ''; });
      return settings;
    },
  });
}

export function useUpdateAdminSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Setting saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) throw error;
      const content: SiteContent = {};
      data?.forEach((row: { section: string; content: Record<string, string> }) => {
        content[row.section] = row.content;
      });
      return content;
    },
  });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ section, content }: { section: string; content: Record<string, string> }) => {
      const { error } = await supabase
        .from('site_content')
        .upsert({ section, content, updated_at: new Date().toISOString() }, { onConflict: 'section' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-content'] });
      toast.success('Content saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('social_links').select('*').order('platform');
      if (error) throw error;
      return data as SocialLink[];
    },
  });
}

export function useUpsertSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: Partial<SocialLink> & { platform: string; url: string }) => {
      const { error } = await supabase
        .from('social_links')
        .upsert({ ...link, updated_at: new Date().toISOString() }, { onConflict: 'platform' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-links'] });
      toast.success('Social link saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Supplier & { product: { name: string } | null })[];
    },
  });
}

export function useUpsertSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: Partial<Supplier>) => {
      if (supplier.id) {
        const { error } = await supabase.from('suppliers').update({ ...supplier, updated_at: new Date().toISOString() }).eq('id', supplier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('suppliers').insert(supplier);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useReturns() {
  return useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase.from('returns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['returns'] });
      toast.success('Return updated');
    },
  });
}

export function usePaymentTransactions() {
  return useQuery({
    queryKey: ['payment-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useFulfillmentRecords() {
  return useQuery({
    queryKey: ['fulfillment-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fulfillment_records')
        .select('*, order:orders(order_number, customer_email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTikTokContent() {
  return useQuery({
    queryKey: ['tiktok-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_content')
        .select('*, product:products(name)')
        .order('post_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertTikTokContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: Record<string, unknown>) => {
      if (content.id) {
        const { error } = await supabase.from('tiktok_content').update({ ...content, updated_at: new Date().toISOString() }).eq('id', content.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tiktok_content').insert(content);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tiktok-content'] });
      toast.success('Content saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
