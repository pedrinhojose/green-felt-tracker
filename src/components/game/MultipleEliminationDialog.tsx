import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skull, User } from 'lucide-react';
import { GamePlayer, Player } from '@/lib/db/models';

interface MultipleEliminationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: GamePlayer[];
  allPlayers: Player[];
  onConfirm: (playerIds: string[], eliminatorId?: string) => void;
}

export function MultipleEliminationDialog({
  open,
  onOpenChange,
  players,
  allPlayers,
  onConfirm
}: MultipleEliminationDialogProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [eliminatorId, setEliminatorId] = useState<string>('');

  // Filter active players (not eliminated)
  const activePlayers = players.filter(p => !p.isEliminated);
  // Potential eliminators (players not selected for elimination)
  const potentialEliminators = activePlayers.filter(p => !selectedPlayers.includes(p.playerId));

  // Helper function to get player name
  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player?.name || 'Jogador Desconhecido';
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleConfirm = () => {
    if (selectedPlayers.length === 0) return;
    
    onConfirm(selectedPlayers, eliminatorId || undefined);
    
    // Reset state
    setSelectedPlayers([]);
    setEliminatorId('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPlayers([]);
    setEliminatorId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-destructive" />
            Eliminar Jogadores
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Player Selection */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Selecione os jogadores a serem eliminados:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activePlayers.map((player) => (
                <div key={player.playerId} className="flex items-center space-x-2">
                  <Checkbox
                    id={player.playerId}
                    checked={selectedPlayers.includes(player.playerId)}
                    onCheckedChange={() => handlePlayerToggle(player.playerId)}
                  />
                  <label
                    htmlFor={player.playerId}
                    className="text-sm text-foreground cursor-pointer flex-1"
                  >
                    {getPlayerName(player.playerId)}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {(player.buyIn ? 1 : 0) + player.rebuys + player.addons} buy-ins
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {selectedPlayers.length > 0 && (
            <>
              <Separator />
              
              {/* Eliminator Selection */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Quem eliminou? (opcional):
                </h4>
                <Select value={eliminatorId} onValueChange={setEliminatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o eliminador..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum/Auto-eliminação</SelectItem>
                    {potentialEliminators.map((player) => (
                      <SelectItem key={player.playerId} value={player.playerId}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {getPlayerName(player.playerId)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Summary */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Resumo:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Jogadores eliminados: {selectedPlayers.length}</div>
                  <div>Eliminador: {
                    eliminatorId 
                      ? getPlayerName(eliminatorId) 
                      : 'Não especificado'
                  }</div>
                  <div className="pt-1">
                    {selectedPlayers.map(playerId => getPlayerName(playerId)).join(', ')}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedPlayers.length === 0}
            variant="destructive"
          >
            Eliminar {selectedPlayers.length > 0 && `(${selectedPlayers.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}