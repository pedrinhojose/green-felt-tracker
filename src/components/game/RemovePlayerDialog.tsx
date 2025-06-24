
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Game, Player } from "@/lib/db/models";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface RemovePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRemovePlayer: (playerId: string) => Promise<boolean>;
  game: Game;
  players: Player[];
  isLoading: boolean;
}

export function RemovePlayerDialog({
  isOpen,
  onClose,
  onRemovePlayer,
  game,
  players,
  isLoading,
}: RemovePlayerDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isMobile = useIsMobile();

  // Filtrar jogadores que podem ser removidos (não eliminados e sem prêmios)
  const removablePlayers = game.players.filter(gp => 
    !gp.isEliminated && gp.prize === 0
  );

  const getPlayer = (playerId: string) => {
    return players.find(p => p.id === playerId);
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRemove = () => {
    if (!selectedPlayerId) return;
    setShowConfirmation(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedPlayerId) return;
    
    const success = await onRemovePlayer(selectedPlayerId);
    if (success) {
      setSelectedPlayerId("");
      setShowConfirmation(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedPlayerId("");
    setShowConfirmation(false);
    onClose();
  };

  const selectedGamePlayer = selectedPlayerId ? game.players.find(gp => gp.playerId === selectedPlayerId) : null;
  const selectedPlayer = selectedPlayerId ? getPlayer(selectedPlayerId) : null;

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={onClose}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-[400px]" : ""}>
          <DialogHeader>
            <DialogTitle>Retirar Jogador da Partida</DialogTitle>
            <DialogDescription>
              Selecione um jogador para remover completamente da partida. 
              Apenas jogadores ativos sem prêmios podem ser removidos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Jogador</label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogador para remover" />
                </SelectTrigger>
                <SelectContent>
                  {removablePlayers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum jogador pode ser removido
                    </SelectItem>
                  ) : (
                    removablePlayers.map((gamePlayer) => {
                      const player = getPlayer(gamePlayer.playerId);
                      if (!player) return null;
                      
                      return (
                        <SelectItem key={gamePlayer.playerId} value={gamePlayer.playerId}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {player.photoUrl ? (
                                <AvatarImage src={player.photoUrl} alt={player.name} />
                              ) : null}
                              <AvatarFallback className="bg-poker-navy text-white text-xs">
                                {getPlayerInitials(player.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{player.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedGamePlayer && selectedPlayer && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium">Resumo do jogador:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Buy-in: {selectedGamePlayer.buyIn ? 'Sim' : 'Não'}</div>
                  <div>Rebuys: {selectedGamePlayer.rebuys}</div>
                  <div>Add-ons: {selectedGamePlayer.addons}</div>
                  <div>Janta: {selectedGamePlayer.joinedDinner ? 'Sim' : 'Não'}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemove}
              disabled={!selectedPlayerId || isLoading || removablePlayers.length === 0}
            >
              Retirar Jogador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedPlayer?.name}</strong> da partida?
              Esta ação não pode ser desfeita e o prize pool será ajustado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} disabled={isLoading}>
              {isLoading ? "Removendo..." : "Confirmar Remoção"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
