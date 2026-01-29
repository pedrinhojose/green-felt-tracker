
import React from "react";
import { Player } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "./PlayerCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayersListProps {
  players: Player[];
  searchQuery: string;
  onAddPlayer: () => void;
  onEditPlayer: (player: Player) => void;
  onDeactivatePlayer: (playerId: string) => void;
  onReactivatePlayer: (playerId: string) => void;
  isDeleting: boolean;
}

export function PlayersList({ 
  players, 
  searchQuery, 
  onAddPlayer, 
  onEditPlayer, 
  onDeactivatePlayer,
  onReactivatePlayer,
  isDeleting 
}: PlayersListProps) {
  const isMobile = useIsMobile();
  
  // Sort players alphabetically by name
  const sortedPlayers = [...players].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return (
    <>
      <div className={`grid gap-3 ${
        isMobile 
          ? "grid-cols-1 sm:grid-cols-2" 
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      }`}>
        {sortedPlayers.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onEdit={onEditPlayer}
            onDeactivate={onDeactivatePlayer}
            onReactivate={onReactivatePlayer}
            isDeleting={isDeleting}
          />
        ))}
      </div>
      
      {sortedPlayers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Nenhum jogador encontrado com este termo." : "Nenhum jogador cadastrado ainda."}
          </p>
          {!searchQuery && (
            <Button
              onClick={onAddPlayer}
              className={`bg-poker-gold hover:bg-poker-gold/80 text-black ${
                isMobile ? 'w-full max-w-sm' : ''
              }`}
            >
              Adicionar seu primeiro jogador
            </Button>
          )}
        </div>
      )}
    </>
  );
}
