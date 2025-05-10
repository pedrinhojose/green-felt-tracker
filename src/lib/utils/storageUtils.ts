
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image to Supabase Storage from a data URL
 * @param dataUrl Base64 data URL of the image
 * @param bucket Name of the storage bucket
 * @returns URL of the uploaded image
 */
export const uploadImageToStorage = async (dataUrl: string, bucket: string = 'fotos'): Promise<string> => {
  try {
    // Extract file content from data URL
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    // Create file object
    const fileName = `${uuidv4()}.${mime.split('/')[1] || 'jpg'}`;
    const file = new File([u8arr], fileName, { type: mime });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(`players/${fileName}`, file, {
        contentType: mime,
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(`players/${fileName}`);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw new Error('Failed to upload image to storage');
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param url Public URL of the image
 * @param bucket Name of the storage bucket
 */
export const deleteImageFromStorage = async (url: string, bucket: string = 'player-photos'): Promise<void> => {
  try {
    // Extract file path from URL
    const storageUrl = supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;
    const filePath = url.replace(storageUrl, '');
    
    if (!filePath) {
      console.log('No valid file path found in URL:', url);
      return;
    }
    
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([cleanPath]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    // Don't throw here to prevent blocking other operations if delete fails
  }
};
