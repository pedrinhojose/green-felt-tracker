
import PrizeWinnerCard from "./PrizeWinnerCard";
import { Game } from "@/lib/db/models";
import { Player } from "@/lib/db/models";

interface PrizeWinnersDisplayProps {
  game: Game;
  players: Player[];
  showWinners: boolean;
}

export default function PrizeWinnersDisplay({ game, players, showWinners }: PrizeWinnersDisplayProps) {
  // Encontrar os jogadores nas posições 1, 2 e 3
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
  
  const firstPlace = getWinnerInfo(1);
  const secondPlace = getWinnerInfo(2);
  const thirdPlace = getWinnerInfo(3);
  
  return (
    <div className="space-y-2 w-full">
      <h4 className="text-sm text-muted-foreground mb-1">Vencedores</h4>
      <div className="flex flex-col space-y-2">
        <PrizeWinnerCard 
          position={1} 
          playerName={firstPlace.name} 
          photoUrl={firstPlace.photoUrl} 
          prize={firstPlace.prize}
          showCard={showWinners}
        />
        <PrizeWinnerCard 
          position={2} 
          playerName={secondPlace.name} 
          photoUrl={secondPlace.photoUrl} 
          prize={secondPlace.prize}
          showCard={showWinners}
        />
        <PrizeWinnerCard 
          position={3} 
          playerName={thirdPlace.name} 
          photoUrl={thirdPlace.photoUrl} 
          prize={thirdPlace.prize}
          showCard={showWinners}
        />
      </div>
    </div>
  );
}
