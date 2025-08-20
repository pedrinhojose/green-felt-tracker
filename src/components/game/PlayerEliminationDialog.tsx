import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GamePlayer, Player } from "@/lib/db/models";

interface PlayerEliminationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerToEliminate: GamePlayer | null;
  players: GamePlayer[];
  allPlayers: Player[];
  onConfirm: (playerId: string, eliminatorId?: string) => void;
}

export function PlayerEliminationDialog({
  open,
  onOpenChange,
  playerToEliminate,
  players,
  allPlayers,
  onConfirm,
}: PlayerEliminationDialogProps) {
  const [eliminatorId, setEliminatorId] = useState<string>("");

  const handleConfirm = () => {
    if (playerToEliminate) {
      onConfirm(playerToEliminate.playerId, eliminatorId || undefined);
      setEliminatorId("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setEliminatorId("");
    onOpenChange(false);
  };

  // Get active players (excluding the one being eliminated)
  const activePlayers = players.filter(
    (p) => !p.isEliminated && p.playerId !== playerToEliminate?.playerId
  );

  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find((p) => p.id === playerId);
    return player?.name || "Jogador Desconhecido";
  };

  if (!playerToEliminate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Jogador</DialogTitle>
          <DialogDescription>
            Quem eliminou <strong>{getPlayerName(playerToEliminate.playerId)}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Jogador que eliminou (opcional)
            </label>
            <Select value={eliminatorId} onValueChange={setEliminatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o eliminador" />
              </SelectTrigger>
              <SelectContent>
                {activePlayers.map((player) => (
                  <SelectItem key={player.playerId} value={player.playerId}>
                    {getPlayerName(player.playerId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} variant="destructive">
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}