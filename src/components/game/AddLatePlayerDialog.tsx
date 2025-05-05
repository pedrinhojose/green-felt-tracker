
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { Player } from "@/lib/db/models";

interface AddLatePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (playerId: string) => Promise<void>;
  availablePlayers: Player[];
  isLoading: boolean;
}

export function AddLatePlayerDialog({
  isOpen,
  onClose,
  onAddPlayer,
  availablePlayers,
  isLoading
}: AddLatePlayerDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  // Helper function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleAddPlayer = async () => {
    if (selectedPlayerId) {
      await onAddPlayer(selectedPlayerId);
      setSelectedPlayerId(null);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setSelectedPlayerId(null);
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar jogador à partida</DialogTitle>
        </DialogHeader>
        
        {availablePlayers.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {availablePlayers.map(player => (
                <div 
                  key={player.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPlayerId === player.id 
                      ? 'bg-poker-navy border border-poker-gold' 
                      : 'hover:bg-poker-dark-green/20 border border-transparent'
                  }`}
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    {player.photoUrl ? (
                      <AvatarImage src={player.photoUrl} alt={player.name} />
                    ) : null}
                    <AvatarFallback className="bg-poker-navy text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <span className="flex-1">{player.name}</span>
                  
                  {selectedPlayerId === player.id && (
                    <CheckCircle className="h-5 w-5 text-poker-gold" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Todos os jogadores já estão na partida
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddPlayer}
            disabled={!selectedPlayerId || isLoading}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            {isLoading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
