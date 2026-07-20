import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Pencil, Trash2 } from 'lucide-react';
import type { GalleryPhoto } from '@/hooks/useGalleryPhotos';

interface Props {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
  canEdit: boolean;
  onEdit?: (p: GalleryPhoto) => void;
  onDelete?: (p: GalleryPhoto) => void;
}

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onChangeIndex,
  canEdit,
  onEdit,
  onDelete,
}: Props) {
  const photo = photos[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && index > 0) onChangeIndex(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onChangeIndex(index + 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, photos.length, onChangeIndex, onClose]);

  if (!photo) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black border-white/10">
        <div className="relative">
          <img
            src={photo.photo_url}
            alt={photo.caption || ''}
            className="w-full max-h-[80vh] object-contain bg-black"
          />

          {index > 0 && (
            <button
              onClick={() => onChangeIndex(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button
              onClick={() => onChangeIndex(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-2">
          {photo.caption && <p className="text-sm">{photo.caption}</p>}
          {photo.event_date && (
            <p className="text-xs text-muted-foreground">
              Data: {new Date(photo.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </p>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={photo.photo_url} download target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-1" /> Baixar
              </a>
            </Button>
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(photo)}>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
            )}
            {canEdit && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Excluir esta foto?')) {
                    onDelete(photo);
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
