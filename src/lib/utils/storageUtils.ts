
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
    console.log('🚀 Iniciando upload de imagem para o bucket:', bucket);
    
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
    
    console.log('📁 Arquivo criado:', {
      name: fileName,
      size: file.size,
      type: file.type
    });
    
    // Upload to Supabase Storage - using 'fotos' bucket and 'players' folder
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(`players/${fileName}`, file, {
        contentType: mime,
        upsert: false
      });
    
    if (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
    
    console.log('✅ Upload realizado com sucesso:', data);
    
    // Get public URL for the file
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(`players/${fileName}`);
    
    console.log('🔗 URL pública gerada:', publicUrl);
    
    // Test if the URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log('🌐 Teste de acesso à URL:', {
        status: response.status,
        accessible: response.ok
      });
    } catch (fetchError) {
      console.warn('⚠️ Não foi possível testar a URL:', fetchError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('💥 Erro completo no upload:', error);
    throw new Error('Failed to upload image to storage');
  }
};

/**
 * Deletes an image from Supabase Storage
 * @param url Public URL of the image
 * @param bucket Name of the storage bucket
 */
export const deleteImageFromStorage = async (url: string, bucket: string = 'fotos'): Promise<void> => {
  try {
    console.log('🗑️ Iniciando deleção de imagem:', url);
    
    // Extract file path from URL
    const storageUrl = supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;
    const filePath = url.replace(storageUrl, '');
    
    if (!filePath) {
      console.log('⚠️ Caminho de arquivo não encontrado na URL:', url);
      return;
    }
    
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    console.log('📂 Deletando arquivo:', cleanPath);
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([cleanPath]);
    
    if (error) {
      console.error('❌ Erro na deleção:', error);
      throw error;
    }
    
    console.log('✅ Imagem deletada com sucesso');
  } catch (error) {
    console.error('💥 Erro na deleção de imagem:', error);
    // Don't throw here to prevent blocking other operations if delete fails
  }
};
