import { useState, useCallback } from 'react';
import { uploadImage, StorageBucket } from '@/lib/storage';
import { toast } from 'sonner';

export function useImageUpload(bucket: StorageBucket) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) return null;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.');
        return null;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast.error('Invalid file type. Use JPEG, PNG, WEBP, or GIF.');
        return null;
      }

      setUploading(true);
      setProgress(10);

      try {
        const { url, error } = await uploadImage(bucket, file);
        setProgress(100);
        if (error) {
          toast.error(`Upload failed: ${error}`);
          return null;
        }
        return url;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [bucket]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<string[]> => {
      const urls: string[] = [];
      for (const file of files) {
        const url = await upload(file);
        if (url) urls.push(url);
      }
      return urls;
    },
    [upload]
  );

  return { upload, uploadMultiple, uploading, progress };
}
