import React, { useMemo, useRef, useState } from 'react';
import { useGalleryPhotos, type GalleryPhoto, type GalleryFolder } from '@/hooks/useGalleryPhotos';
import { useOrgMemberRole } from '@/hooks/useOrgMemberRole';
import { Button } from '@/components/ui/button';
import {
  Camera,
  ImagePlus,
  Loader2,
  Folder,
  ChevronLeft,
  X,
  Trash2,
  FolderInput,
  Check,
  Pencil,
  MoreVertical,
} from 'lucide-react';
import { PhotoUploadDialog } from '@/components/gallery/PhotoUploadDialog';
import { PhotoLightbox } from '@/components/gallery/PhotoLightbox';
import { PhotoEditDialog } from '@/components/gallery/PhotoEditDialog';
import { MoveToFolderDialog } from '@/components/gallery/MoveToFolderDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

function photoYear(p: GalleryPhoto) {
  const d = p.event_date ? new Date(p.event_date + 'T12:00:00') : new Date(p.created_at);
  return d.getFullYear();
}

export default function GalleryPage() {
  const {
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
  } = useGalleryPhotos();
  const { canEdit } = useOrgMemberRole();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState<GalleryPhoto | null>(null);
  const [activeFolder, setActiveFolder] = useState<GalleryFolder | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveOpen, setMoveOpen] = useState(false);

  const pressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  // Visible photos: filter by active folder
  const visiblePhotos = useMemo(() => {
    if (activeFolder) return photos.filter((p) => p.folder_id === activeFolder.id);
    return photos.filter((p) => !p.folder_id);
  }, [photos, activeFolder]);

  // Group by year (only when not inside a folder OR always? keep grouping in both)
  const groupedByYear = useMemo(() => {
    const map = new Map<number, GalleryPhoto[]>();
    for (const p of visiblePhotos) {
      const y = photoYear(p);
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [visiblePhotos]);

  const folderCounts = useMemo(() => {
    const map = new Map<string, { count: number; thumb?: string }>();
    for (const p of photos) {
      if (!p.folder_id) continue;
      if (!map.has(p.folder_id)) map.set(p.folder_id, { count: 0, thumb: p.thumbnail_url });
      map.get(p.folder_id)!.count++;
    }
    return map;
  }, [photos]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startLongPress = (id: string) => {
    longPressFired.current = false;
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      setSelectionMode(true);
      setSelected((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      if (navigator.vibrate) navigator.vibrate(30);
    }, 450);
  };

  const cancelLongPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handlePhotoClick = (p: GalleryPhoto) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (selectionMode) {
      toggleSelect(p.id);
    } else {
      setLightboxPhoto(p);
    }
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelected(new Set());
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Excluir ${selected.size} foto(s)? Esta ação não pode ser desfeita.`)) return;
    await bulkDeletePhotos(Array.from(selected));
    exitSelection();
  };

  const handleMove = async (folderId: string | null) => {
    if (!selected.size) return;
    await movePhotosToFolder(Array.from(selected), folderId);
    exitSelection();
  };

  const handleDeleteFolder = async (f: GalleryFolder) => {
    const count = folderCounts.get(f.id)?.count ?? 0;
    if (!confirm(`Excluir pasta "${f.name}" e suas ${count} foto(s)?`)) return;
    await deleteFolder(f.id);
    if (activeFolder?.id === f.id) setActiveFolder(null);
  };

  const handleRenameFolder = async (f: GalleryFolder) => {
    const name = prompt('Novo nome da pasta:', f.name);
    if (!name || !name.trim() || name === f.name) return;
    await renameFolder(f.id, name);
  };

  const handleCreateFolder = async () => {
    const name = prompt('Nome da nova pasta (ex: 2025, "Torneio de Natal"):');
    if (!name || !name.trim()) return;
    await createFolder(name);
  };

  // Lightbox needs an index within visiblePhotos flat list ordered by year DESC then created_at DESC
  const flatVisible = useMemo(() => groupedByYear.flatMap(([, arr]) => arr), [groupedByYear]);
  const lightboxIndex = lightboxPhoto ? flatVisible.findIndex((p) => p.id === lightboxPhoto.id) : -1;

  const gridClass =
    'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2';

  const renderPhoto = (p: GalleryPhoto) => {
    const isSelected = selected.has(p.id);
    return (
      <div
        key={p.id}
        onClick={() => handlePhotoClick(p)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (canEdit) {
            setSelectionMode(true);
            toggleSelect(p.id);
          }
        }}
        onTouchStart={() => canEdit && startLongPress(p.id)}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onMouseDown={() => canEdit && startLongPress(p.id)}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        className={`relative aspect-square overflow-hidden rounded-md group border cursor-pointer transition-all ${
          isSelected
            ? 'border-poker-gold ring-2 ring-poker-gold scale-95'
            : 'border-white/5 hover:border-poker-gold/50'
        }`}
      >
        <img
          src={p.thumbnail_url}
          alt={p.caption || ''}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
        {selectionMode && (
          <div
            className={`absolute top-1.5 left-1.5 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
              isSelected
                ? 'bg-poker-gold border-poker-gold text-black'
                : 'bg-black/50 border-white/70'
            }`}
          >
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {activeFolder && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveFolder(null)}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent flex items-center gap-2 truncate">
              {activeFolder ? (
                <>
                  <Folder className="h-7 w-7 text-poker-gold shrink-0" />
                  <span className="truncate">{activeFolder.name}</span>
                </>
              ) : (
                <>
                  <Camera className="h-7 w-7 text-poker-gold shrink-0" />
                  <span>Galeria do Clube</span>
                </>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeFolder
                ? `${visiblePhotos.length} foto${visiblePhotos.length === 1 ? '' : 's'}`
                : `${photos.length} foto${photos.length === 1 ? '' : 's'} • ${folders.length} pasta${folders.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {canEdit && !selectionMode && (
          <div className="flex gap-2">
            {!activeFolder && (
              <Button variant="outline" onClick={handleCreateFolder} className="hidden sm:inline-flex">
                <Folder className="mr-2 h-4 w-4" /> Nova pasta
              </Button>
            )}
            <Button onClick={() => setUploadOpen(true)} className="bg-poker-gold hover:bg-amber-500 text-black">
              <ImagePlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Adicionar fotos</span>
              <span className="sm:hidden">Enviar</span>
            </Button>
          </div>
        )}
      </div>

      {loading && photos.length === 0 && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-poker-gold" />
        </div>
      )}

      {/* Folders section (only on root view) */}
      {!activeFolder && folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Pastas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {folders.map((f) => {
              const info = folderCounts.get(f.id);
              return (
                <div key={f.id} className="relative group">
                  <button
                    onClick={() => setActiveFolder(f)}
                    className="w-full aspect-square rounded-lg border border-white/10 hover:border-poker-gold/50 bg-white/5 overflow-hidden flex flex-col transition-all"
                  >
                    <div className="flex-1 relative bg-black/40">
                      {info?.thumb ? (
                        <img src={info.thumb} className="w-full h-full object-cover opacity-80" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Folder className="h-12 w-12 text-poker-gold/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                        <p className="text-xs text-white/70">
                          {info?.count ?? 0} foto{(info?.count ?? 0) === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </button>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4 text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameFolder(f)}>
                          <Pencil className="h-4 w-4 mr-2" /> Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFolder(f)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir pasta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
            {canEdit && (
              <button
                onClick={handleCreateFolder}
                className="aspect-square rounded-lg border-2 border-dashed border-white/15 hover:border-poker-gold/50 hover:bg-white/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-poker-gold"
              >
                <Folder className="h-8 w-8" />
                <span className="text-xs">Nova pasta</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline by year */}
      {visiblePhotos.length === 0 && !loading ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {activeFolder ? 'Nenhuma foto nesta pasta.' : 'Nenhuma foto na galeria ainda.'}
          </p>
          {canEdit && (
            <Button variant="outline" className="mt-4" onClick={() => setUploadOpen(true)}>
              Enviar foto
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {!activeFolder && !folders.length && photos.length > 0 && photos.every((p) => !p.folder_id) && null}
          {groupedByYear.map(([year, arr]) => (
            <section key={year}>
              <div className="flex items-center gap-3 mb-3 sticky top-14 z-10 bg-background/95 backdrop-blur py-2 -mx-4 px-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-poker-gold">{year}</h2>
                <span className="text-xs text-muted-foreground">
                  {arr.length} foto{arr.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className={gridClass}>{arr.map(renderPhoto)}</div>
            </section>
          ))}
        </div>
      )}

      {/* Selection action bar */}
      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-t border-white/10 p-3">
          <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={exitSelection}>
                <X className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">{selected.size} selecionada(s)</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!selected.size}
                onClick={() => {
                  if (!selected.size) return;
                  if (visiblePhotos.length && selected.size === visiblePhotos.length) {
                    setSelected(new Set());
                  } else {
                    setSelected(new Set(visiblePhotos.map((p) => p.id)));
                  }
                }}
              >
                {selected.size === visiblePhotos.length && visiblePhotos.length > 0
                  ? 'Limpar'
                  : 'Selecionar tudo'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!selected.size}
                onClick={() => setMoveOpen(true)}
              >
                <FolderInput className="h-4 w-4 mr-1" /> Mover
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!selected.size}
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      <PhotoUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={(files) => uploadPhotos(files, activeFolder?.id ?? null)}
        uploading={uploading}
      />

      {lightboxIndex >= 0 && (
        <PhotoLightbox
          photos={flatVisible}
          index={lightboxIndex}
          onClose={() => setLightboxPhoto(null)}
          onChangeIndex={(i) => setLightboxPhoto(flatVisible[i])}
          canEdit={canEdit}
          onEdit={(p) => {
            setLightboxPhoto(null);
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

      <MoveToFolderDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        folders={folders}
        count={selected.size}
        onMove={handleMove}
        onCreateFolder={createFolder}
      />
    </div>
  );
}
