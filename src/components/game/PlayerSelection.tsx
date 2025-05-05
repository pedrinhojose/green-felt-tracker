
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player, GamePlayer } from "@/lib/db/models";

interface PlayerSelectionProps {
  players: Player[];
  onStartGame: (selectedPlayerIds: Set<string>) => void;
}

export default function PlayerSelection({ players, onStartGame }: PlayerSelectionProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId);
      } else {
        newSelected.add(playerId);
      }
      return newSelected;
    });
  };
  
  const handleStartGame = () => {
    if (selectedPlayers.size === 0) return;
    onStartGame(selectedPlayers);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Selecionar Jogadores</span>
          <span className="text-sm">{selectedPlayers.size} selecionados</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {players.map(player => (
            <div 
              key={player.id}
              className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${
                selectedPlayers.has(player.id) 
                  ? 'bg-poker-dark-green border border-poker-gold' 
                  : 'bg-poker-dark-green/50'
              }`}
              onClick={() => togglePlayerSelection(player.id)}
            >
              <Avatar className="h-10 w-10">
                {player.photoUrl ? (
                  <AvatarImage src={player.photoUrl} alt={player.name} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white">
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>
              
              <span className="flex-1">{player.name}</span>
              
              <Checkbox 
                checked={selectedPlayers.has(player.id)}
                onCheckedChange={() => togglePlayerSelection(player.id)}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleStartGame}
            disabled={selectedPlayers.size === 0}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            Iniciar Partida
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
