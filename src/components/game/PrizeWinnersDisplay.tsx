
import PrizeWinnerCard from "./PrizeWinnerCard";
import { Game, Season } from "@/lib/db/models";
import { Player } from "@/lib/db/models";

interface PrizeWinnersDisplayProps {
  game: Game;
  players: Player[];
  showWinners: boolean;
  activeSeason: Season | null;
}

export default function PrizeWinnersDisplay({ game, players, showWinners, activeSeason }: PrizeWinnersDisplayProps) {
  // Encontrar informações do jogador por posição
  const getWinnerInfo = (position: number) => {
    const gamePlayer = game.players.find(p => p.position === position);
    
    if (!gamePlayer) {
      return {
        name: "Indefinido",
        photoUrl: null,
        prize: 0
      };
    }
    
    const playerInfo = players.find(p => p.id === gamePlayer.playerId);
    
    return {
      name: playerInfo?.name || "Desconhecido",
      photoUrl: playerInfo?.photoUrl || null,
      prize: gamePlayer.prize
    };
  };
  
  // Obter posições premiadas da configuração da temporada
  const prizePositions = activeSeason?.weeklyPrizeSchema || [];
  
  // Ordenar por posição para garantir ordem correta
  const sortedPositions = [...prizePositions].sort((a, b) => a.position - b.position);
  
  // Gerar lista de vencedores baseado nas posições configuradas
  const winners = sortedPositions.map(entry => ({
    position: entry.position,
    ...getWinnerInfo(entry.position)
  }));

  // Se não houver configuração de temporada, fallback para 3 primeiros
  const displayWinners = winners.length > 0 ? winners : [
    { position: 1, ...getWinnerInfo(1) },
    { position: 2, ...getWinnerInfo(2) },
    { position: 3, ...getWinnerInfo(3) }
  ];
  
  return (
    <div className="space-y-2 w-full">
      <h4 className="text-sm text-muted-foreground mb-1">Vencedores</h4>
      <div className="flex flex-col space-y-2">
        {displayWinners.map((winner) => (
          <PrizeWinnerCard 
            key={winner.position}
            position={winner.position} 
            playerName={winner.name} 
            photoUrl={winner.photoUrl} 
            prize={winner.prize}
            showCard={showWinners}
          />
        ))}
      </div>
    </div>
  );
}
