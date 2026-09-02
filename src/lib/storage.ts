import { supabase } from './supabase';

export type StorageBucket = 'product-images' | 'site-images' | 'return-evidence';

export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error('Upload error:', error);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}

export async function deleteImage(bucket: StorageBucket, path: string): Promise<void> {
  const fileName = path.split('/').pop();
  if (!fileName) return;
  await supabase.storage.from(bucket).remove([fileName]);
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
