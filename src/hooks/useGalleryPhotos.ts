import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';
import { compressForGallery } from '@/lib/utils/galleryImageUtils';
import { uploadGalleryPhoto, deleteGalleryPhotoFiles } from '@/lib/utils/galleryStorage';

export interface GalleryPhoto {
  id: string;
  organization_id: string;
  uploaded_by: string;
  photo_url: string;
  thumbnail_url: string;
  caption: string | null;
  event_date: string | null;
  game_id: string | null;
  season_id: string | null;
  file_size: number | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryFolder {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function useGalleryPhotos() {
  const { currentOrganization } = useOrganization();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const orgId = currentOrganization?.id;

  const loadAll = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const [photoRes, folderRes] = await Promise.all([
      supabase
        .from('gallery_photos')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1000),
      (supabase as any)
        .from('gallery_folders')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),
    ]);
    setLoading(false);
    if (photoRes.error) {
      console.error(photoRes.error);
      toast.error('Erro ao carregar galeria');
      return;
    }
    setPhotos((photoRes.data as GalleryPhoto[]) || []);
    if (!folderRes.error) setFolders(((folderRes.data as GalleryFolder[]) || []));
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      setPhotos([]);
      setFolders([]);
      loadAll();
    }
  }, [orgId, loadAll]);

  const uploadPhotos = async (files: File[], folderId?: string | null): Promise<number> => {
    if (!orgId) {
      toast.error('Nenhum clube selecionado');
      return 0;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Usuário não autenticado');
      return 0;
    }

    setUploading(true);
    let success = 0;
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        toast.loading(`Comprimindo ${i + 1}/${total}...`, { id: 'gallery-upload' });
        const { full, thumbnail, fullSize } = await compressForGallery(file);

        toast.loading(`Enviando ${i + 1}/${total}...`, { id: 'gallery-upload' });
        const { photoUrl, thumbnailUrl } = await uploadGalleryPhoto(orgId, full, thumbnail);

        const { data, error } = await supabase
          .from('gallery_photos')
          .insert({
            organization_id: orgId,
            uploaded_by: userId,
            photo_url: photoUrl,
            thumbnail_url: thumbnailUrl,
            file_size: fullSize,
            folder_id: folderId ?? null,
          } as any)
          .select()
          .single();

        if (error) throw error;
        setPhotos((prev) => [data as GalleryPhoto, ...prev]);
        success++;
      } catch (err) {
        console.error('Erro no upload:', file.name, err);
        toast.error(`Falha ao enviar ${file.name}`);
      }
    }

    setUploading(false);
    toast.dismiss('gallery-upload');
    if (success > 0) toast.success(`${success} foto(s) enviada(s)`);
    return success;
  };

  const updatePhoto = async (
    id: string,
    patch: Partial<Pick<GalleryPhoto, 'caption' | 'event_date' | 'game_id' | 'season_id' | 'folder_id'>>
  ) => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .update(patch as any)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      toast.error('Erro ao atualizar foto');
      throw error;
    }
    setPhotos((prev) => prev.map((p) => (p.id === id ? (data as GalleryPhoto) : p)));
  };

  const deletePhoto = async (photo: GalleryPhoto) => {
    try {
      await deleteGalleryPhotoFiles(photo.photo_url, photo.thumbnail_url);
    } catch (e) {
      console.warn('Falha ao remover arquivos do storage (seguindo)', e);
    }
    const { error } = await supabase.from('gallery_photos').delete().eq('id', photo.id);
    if (error) {
      toast.error('Erro ao excluir foto');
      throw error;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast.success('Foto excluída');
  };

  const bulkDeletePhotos = async (ids: string[]) => {
    const targets = photos.filter((p) => ids.includes(p.id));
    toast.loading(`Excluindo ${targets.length} foto(s)...`, { id: 'bulk-del' });
    let ok = 0;
    for (const p of targets) {
      try {
        await deleteGalleryPhotoFiles(p.photo_url, p.thumbnail_url);
      } catch {
        // ignore
      }
      const { error } = await supabase.from('gallery_photos').delete().eq('id', p.id);
      if (!error) ok++;
    }
    setPhotos((prev) => prev.filter((p) => !ids.includes(p.id)));
    toast.dismiss('bulk-del');
    toast.success(`${ok} foto(s) excluída(s)`);
  };

  const movePhotosToFolder = async (ids: string[], folderId: string | null) => {
    const { error } = await supabase
      .from('gallery_photos')
      .update({ folder_id: folderId } as any)
      .in('id', ids);
    if (error) {
      toast.error('Erro ao mover fotos');
      throw error;
    }
    setPhotos((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, folder_id: folderId } : p))
    );
    toast.success(folderId ? 'Fotos movidas para a pasta' : 'Fotos removidas da pasta');
  };

  const createFolder = async (name: string): Promise<GalleryFolder | null> => {
    if (!orgId) return null;
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return null;
    const { data, error } = await (supabase as any)
      .from('gallery_folders')
      .insert({ organization_id: orgId, name: name.trim(), created_by: userId })
      .select()
      .single();
    if (error) {
      toast.error('Erro ao criar pasta');
      throw error;
    }
    const f = data as GalleryFolder;
    setFolders((prev) => [f, ...prev]);
    toast.success('Pasta criada');
    return f;
  };

  const renameFolder = async (id: string, name: string) => {
    const { data, error } = await (supabase as any)
      .from('gallery_folders')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      toast.error('Erro ao renomear pasta');
      throw error;
    }
    setFolders((prev) => prev.map((f) => (f.id === id ? (data as GalleryFolder) : f)));
    toast.success('Pasta renomeada');
  };

  const deleteFolder = async (id: string) => {
    // remove storage files for all photos in this folder (cascade will remove DB rows)
    const inFolder = photos.filter((p) => p.folder_id === id);
    toast.loading(`Excluindo pasta e ${inFolder.length} foto(s)...`, { id: 'del-folder' });
    for (const p of inFolder) {
      try {
        await deleteGalleryPhotoFiles(p.photo_url, p.thumbnail_url);
      } catch {
        // ignore
      }
    }
    const { error } = await (supabase as any).from('gallery_folders').delete().eq('id', id);
    toast.dismiss('del-folder');
    if (error) {
      toast.error('Erro ao excluir pasta');
      throw error;
    }
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setPhotos((prev) => prev.filter((p) => p.folder_id !== id));
    toast.success('Pasta excluída');
  };

  return {
    photos,
    folders,
    loading,
    uploading,
    uploadPhotos,
    updatePhoto,
    deletePhoto,
    bulkDeletePhotos,
    movePhotosToFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    reload: loadAll,
  };
}
