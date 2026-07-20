import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Folder, X } from 'lucide-react';
import type { GalleryFolder } from '@/hooks/useGalleryPhotos';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folders: GalleryFolder[];
  count: number;
  onMove: (folderId: string | null) => Promise<void> | void;
  onCreateFolder: (name: string) => Promise<GalleryFolder | null>;
}

export function MoveToFolderDialog({ open, onOpenChange, folders, count, onMove, onCreateFolder }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleMove = async (folderId: string | null) => {
    setBusy(true);
    try {
      await onMove(folderId);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const f = await onCreateFolder(newName);
      if (f) {
        await onMove(f.id);
        onOpenChange(false);
        setNewName('');
        setCreating(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mover {count} foto{count === 1 ? '' : 's'} para...</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          <button
            onClick={() => handleMove(null)}
            disabled={busy}
            className="w-full flex items-center gap-3 p-3 rounded border border-white/10 hover:border-poker-gold/50 hover:bg-white/5 transition text-left"
          >
            <X className="h-5 w-5 text-muted-foreground" />
            <span>Remover da pasta (linha do tempo)</span>
          </button>

          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => handleMove(f.id)}
              disabled={busy}
              className="w-full flex items-center gap-3 p-3 rounded border border-white/10 hover:border-poker-gold/50 hover:bg-white/5 transition text-left"
            >
              <Folder className="h-5 w-5 text-poker-gold" />
              <span className="truncate">{f.name}</span>
            </button>
          ))}

          {creating ? (
            <div className="flex gap-2 items-center p-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da pasta (ex: 2025)"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button size="sm" onClick={handleCreate} disabled={busy || !newName.trim()}>
                Criar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-3 p-3 rounded border border-dashed border-white/20 hover:border-poker-gold/50 hover:bg-white/5 transition text-left"
            >
              <FolderPlus className="h-5 w-5 text-poker-gold" />
              <span>Nova pasta...</span>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
