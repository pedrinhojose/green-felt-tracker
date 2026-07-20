import React, { useState } from 'react';
import { useGalleryPhotos, type GalleryPhoto } from '@/hooks/useGalleryPhotos';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { Button } from '@/components/ui/button';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import { PhotoUploadDialog } from '@/components/gallery/PhotoUploadDialog';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { PhotoEditDialog } from '@/components/gallery/PhotoEditDialog';

export default function GalleryPage() {
  const { photos, loading, uploading, hasMore, loadMore, uploadPhotos, updatePhoto, deletePhoto } =
    useGalleryPhotos();
  const { canEdit } = useOrgMemberRole();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
            <Camera className="h-7 w-7 text-poker-gold" />
            Galeria do Clube
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {photos.length} foto{photos.length === 1 ? '' : 's'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setUploadOpen(true)} className="bg-poker-gold hover:bg-amber-500 text-black">
            <ImagePlus className="mr-2 h-4 w-4" />
            Adicionar fotos
          </Button>
        )}
      </div>

      {photos.length === 0 && !loading ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma foto na galeria ainda.</p>
          {canEdit && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setUploadOpen(true)}
            >
              Enviar primeira foto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-square overflow-hidden rounded-md group border border-white/5 hover:border-poker-gold/50 transition-colors"
            >
              <img
                src={p.thumbnail_url}
                alt={p.caption || ''}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {p.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white line-clamp-2 text-left">{p.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {hasMore && photos.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Carregar mais
          </Button>
        </div>
      )}

      <PhotoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={uploadPhotos}
        uploading={uploading}
      />

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
          canEdit={canEdit}
          onEdit={(p) => {
            setLightboxIndex(null);
            setEditPhoto(p);
          }}
          onDelete={deletePhoto}
        />
      )}

      <PhotoEditDialog
        photo={editPhoto}
        onClose={() => setEditPhoto(null)}
        onSave={updatePhoto}
      />
    </div>
  );
}
