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
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 30;

export function useGalleryPhotos() {
  const { currentOrganization } = useOrganization();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const orgId = currentOrganization?.id;

  const load = useCallback(
    async (reset = false) => {
      if (!orgId) return;
      setLoading(true);
      const from = reset ? 0 : page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(from, to);
      setLoading(false);
      if (error) {
        console.error(error);
        toast.error('Erro ao carregar galeria');
        return;
      }
      const rows = (data as GalleryPhoto[]) || [];
      setHasMore(rows.length === PAGE_SIZE);
      if (reset) {
        setPhotos(rows);
        setPage(1);
      } else {
        setPhotos((prev) => [...prev, ...rows]);
        setPage((p) => p + 1);
      }
    },
    [orgId, page]
  );

  useEffect(() => {
    if (orgId) {
      setPage(0);
      setPhotos([]);
      setHasMore(true);
      // trigger initial load
      (async () => {
        const { data, error } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1);
        if (!error) {
          const rows = (data as GalleryPhoto[]) || [];
          setPhotos(rows);
          setHasMore(rows.length === PAGE_SIZE);
          setPage(1);
        }
      })();
    }
  }, [orgId]);

  const uploadPhotos = async (files: File[]): Promise<number> => {
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
          })
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
    patch: Partial<Pick<GalleryPhoto, 'caption' | 'event_date' | 'game_id' | 'season_id'>>
  ) => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      toast.error('Erro ao atualizar foto');
      throw error;
    }
    setPhotos((prev) => prev.map((p) => (p.id === id ? (data as GalleryPhoto) : p)));
    toast.success('Foto atualizada');
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

  return {
    photos,
    loading,
    uploading,
    hasMore,
    loadMore: () => load(false),
    uploadPhotos,
    updatePhoto,
    deletePhoto,
  };
}
