import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { applyPlayerPhotoMask } from "@/lib/utils/playerPhotoMask";
import { uploadImageToStorage } from "@/lib/utils/storageUtils";

export function StandardizePhotosButton() {
  const { players, savePlayer } = usePoker();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [cancelRequested, setCancelRequested] = useState(false);

  const eligible = players.filter(
    (p) => p.isActive !== false && p.photoUrl && p.photoUrl.trim() !== ""
  );

  const fetchAsDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Falha ao ler blob"));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const runBatch = async () => {
    setIsOpen(false);
    setIsProcessing(true);
    setCancelRequested(false);
    setProgress({ current: 0, total: eligible.length });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < eligible.length; i++) {
      if (cancelRequested) break;
      const player = eligible[i];
      setProgress({ current: i + 1, total: eligible.length });
      try {
        const dataUrl = await fetchAsDataUrl(player.photoUrl!);
        const masked = await applyPlayerPhotoMask(dataUrl);
        const newUrl = await uploadImageToStorage(masked, "fotos");
        await savePlayer({ ...player, photoUrl: newUrl });
        success++;
      } catch (err) {
        console.error(`Falha ao processar ${player.name}:`, err);
        failed++;
      }
    }

    setIsProcessing(false);
    toast({
      title: "Padronização concluída",
      description: `${success} foto(s) padronizada(s)${failed > 0 ? `, ${failed} falharam` : ""}.`,
    });
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-poker-gold" />
          <span>
            Processando {progress.current} de {progress.total}...
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => setCancelRequested(true)}
          >
            Cancelar
          </Button>
        </div>
        <Progress
          value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
        />
      </div>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={eligible.length === 0}>
          <Sparkles className="mr-2 h-4 w-4" />
          Padronizar fotos ({eligible.length})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Padronizar todas as fotos?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso vai reprocessar <strong>{eligible.length}</strong> foto(s) de jogadores
            ativos: remover o fundo original, aplicar fundo preto sólido e contorno
            branco em volta da silhueta. Pode levar alguns minutos.
            <br />
            <br />
            A primeira execução baixa um modelo de IA (~30 MB, feito 1x por navegador).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={runBatch}>Iniciar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
