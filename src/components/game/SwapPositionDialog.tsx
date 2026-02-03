import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { GamePlayer, Player } from "@/lib/db/models";
import { ArrowLeftRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SwapPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlayer: GamePlayer | null;
  playersWithPosition: GamePlayer[];
  allPlayers: Player[];
  onConfirmSwap: (player1Id: string, player2Id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function SwapPositionDialog({
  open,
  onOpenChange,
  selectedPlayer,
  playersWithPosition,
  allPlayers,
  onConfirmSwap,
  isLoading = false,
}: SwapPositionDialogProps) {
  const [targetPlayerId, setTargetPlayerId] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Reset target when dialog opens/closes or selected player changes
  useEffect(() => {
    if (open) {
      setTargetPlayerId("");
    }
  }, [open, selectedPlayer]);

  const getPlayerName = (playerId: string): string => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.name || "Desconhecido";
  };

  const getPlayerPhoto = (playerId: string): string | undefined => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.photoUrl;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter out the selected player from the swap targets
  const availableTargets = playersWithPosition.filter(
    p => p.playerId !== selectedPlayer?.playerId
  );

  const targetPlayer = playersWithPosition.find(p => p.playerId === targetPlayerId);

  const handleConfirm = async () => {
    if (!selectedPlayer || !targetPlayerId) return;

    setIsSwapping(true);
    try {
      const success = await onConfirmSwap(selectedPlayer.playerId, targetPlayerId);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  if (!selectedPlayer) return null;

  const selectedPlayerName = getPlayerName(selectedPlayer.playerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-poker-gold" />
            Trocar Posição
          </DialogTitle>
          <DialogDescription>
            Troque a posição entre dois jogadores. Pontos e prêmios serão recalculados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected player info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              {getPlayerPhoto(selectedPlayer.playerId) ? (
                <AvatarImage src={getPlayerPhoto(selectedPlayer.playerId)} alt={selectedPlayerName} />
              ) : null}
              <AvatarFallback className="bg-poker-navy text-white text-sm">
                {getInitials(selectedPlayerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{selectedPlayerName}</p>
              <p className="text-sm text-poker-gold">{selectedPlayer.position}º lugar</p>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Target player select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trocar com:</label>
            <Select value={targetPlayerId} onValueChange={setTargetPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogador" />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((gp) => (
                  <SelectItem key={gp.playerId} value={gp.playerId}>
                    <div className="flex items-center gap-2">
                      <span>{getPlayerName(gp.playerId)}</span>
                      <span className="text-poker-gold">({gp.position}º lugar)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview of swap result */}
          {targetPlayer && (
            <div className="p-3 bg-poker-gold/10 border border-poker-gold/30 rounded-lg">
              <p className="text-sm font-medium text-poker-gold mb-2">Resultado da troca:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">{selectedPlayerName}</span>
                  {" → "}
                  <span className="text-poker-gold">{targetPlayer.position}º lugar</span>
                </p>
                <p>
                  <span className="font-medium">{getPlayerName(targetPlayer.playerId)}</span>
                  {" → "}
                  <span className="text-poker-gold">{selectedPlayer.position}º lugar</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSwapping || isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!targetPlayerId || isSwapping || isLoading}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            {isSwapping ? "Trocando..." : "Confirmar Troca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
