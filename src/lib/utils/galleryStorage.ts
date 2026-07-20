import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'fotos';

export interface UploadedGalleryUrls {
  photoUrl: string;
  thumbnailUrl: string;
  photoPath: string;
  thumbnailPath: string;
}

export async function uploadGalleryPhoto(
  organizationId: string,
  full: Blob,
  thumbnail: Blob
): Promise<UploadedGalleryUrls> {
  const id = uuidv4();
  const photoPath = `gallery/${organizationId}/${id}.jpg`;
  const thumbnailPath = `gallery/${organizationId}/thumbs/${id}.jpg`;

  const { error: e1 } = await supabase.storage
    .from(BUCKET)
    .upload(photoPath, full, { contentType: 'image/jpeg', upsert: false });
  if (e1) throw e1;

  const { error: e2 } = await supabase.storage
    .from(BUCKET)
    .upload(thumbnailPath, thumbnail, { contentType: 'image/jpeg', upsert: false });
  if (e2) {
    // rollback do full
    await supabase.storage.from(BUCKET).remove([photoPath]);
    throw e2;
  }

  const photoUrl = supabase.storage.from(BUCKET).getPublicUrl(photoPath).data.publicUrl;
  const thumbnailUrl = supabase.storage.from(BUCKET).getPublicUrl(thumbnailPath).data.publicUrl;

  return { photoUrl, thumbnailUrl, photoPath, thumbnailPath };
}

export async function deleteGalleryPhotoFiles(photoUrl: string, thumbnailUrl: string) {
  const base = supabase.storage.from(BUCKET).getPublicUrl('').data.publicUrl;
  const paths = [photoUrl, thumbnailUrl]
    .map((u) => u.replace(base, '').replace(/^\/+/, ''))
    .filter(Boolean);
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}
