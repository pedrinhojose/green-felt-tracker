import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { GalleryPhoto } from '@/hooks/useGalleryPhotos';

interface Props {
  photo: GalleryPhoto | null;
  onClose: () => void;
  onSave: (
    id: string,
    patch: Partial<Pick<GalleryPhoto, 'caption' | 'event_date' | 'game_id' | 'season_id'>>
  ) => Promise<void>;
}

export function PhotoEditDialog({ photo, onClose, onSave }: Props) {
  const [caption, setCaption] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
      setEventDate(photo.event_date || '');
    }
  }, [photo]);

  if (!photo) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(photo.id, {
        caption: caption.trim() || null,
        event_date: eventDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!photo} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar foto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="caption">Legenda</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Adicione uma legenda"
              maxLength={500}
            />
          </div>
          <div>
            <Label htmlFor="event_date">Data do evento</Label>
            <Input
              id="event_date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
