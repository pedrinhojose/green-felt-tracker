import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Pencil, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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

const SWIPE_THRESHOLD = 50;
const HINT_KEY = 'gallery_swipe_hint_shown';

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onChangeIndex,
  canEdit,
  onEdit,
  onDelete,
}: Props) {
  const isMobile = useIsMobile();
  const photo = photos[index];

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const axisLocked = useRef<'x' | 'y' | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && index > 0) onChangeIndex(index - 1);
      if (e.key === 'ArrowRight' && index < photos.length - 1) onChangeIndex(index + 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, photos.length, onChangeIndex, onClose]);

  // First-time hint on mobile
  useEffect(() => {
    if (!isMobile || photos.length <= 1) return;
    try {
      if (!sessionStorage.getItem(HINT_KEY)) {
        setShowHint(true);
        sessionStorage.setItem(HINT_KEY, '1');
        const t = setTimeout(() => setShowHint(false), 1800);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, [isMobile, photos.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (photos.length <= 1) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    axisLocked.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    if (axisLocked.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        axisLocked.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
    }
    if (axisLocked.current !== 'x') return;

    // resistance at edges
    let effective = dx;
    if ((index === 0 && dx > 0) || (index === photos.length - 1 && dx < 0)) {
      effective = dx / 3;
    }
    setDragX(effective);
  };

  const onTouchEnd = () => {
    if (axisLocked.current === 'x') {
      if (dragX <= -SWIPE_THRESHOLD && index < photos.length - 1) {
        onChangeIndex(index + 1);
      } else if (dragX >= SWIPE_THRESHOLD && index > 0) {
        onChangeIndex(index - 1);
      }
    }
    setDragX(0);
    setIsDragging(false);
    touchStartX.current = null;
    touchStartY.current = null;
    axisLocked.current = null;
  };

  if (!photo) return null;

  const totalDots = Math.min(photos.length, 7);
  const dotStart = Math.max(0, Math.min(index - 3, photos.length - totalDots));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black border-white/10">
        <div className="relative overflow-hidden">
          {/* Counter */}
          {photos.length > 1 && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {index + 1} / {photos.length}
            </div>
          )}

          <img
            src={photo.photo_url}
            alt={photo.caption || ''}
            draggable={false}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transform: `translateX(${dragX}px)`,
              transition: isDragging ? 'none' : 'transform 200ms ease-out',
              touchAction: 'pan-y',
            }}
            className="w-full max-h-[80vh] object-contain bg-black select-none"
          />

          {/* Desktop arrows */}
          {!isMobile && index > 0 && (
            <button
              onClick={() => onChangeIndex(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {!isMobile && index < photos.length - 1 && (
            <button
              onClick={() => onChangeIndex(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Swipe hint (mobile, first time) */}
          {isMobile && showHint && photos.length > 1 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black/70 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <ChevronLeft className="h-4 w-4" />
                arraste
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Dots pagination (mobile) */}
          {isMobile && photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full">
              {Array.from({ length: totalDots }).map((_, i) => {
                const realIdx = dotStart + i;
                const active = realIdx === index;
                return (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      active ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                );
              })}
            </div>
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
