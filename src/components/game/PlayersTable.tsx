
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, GamePlayer, Player, Season } from "@/lib/db/models";
import { PlayerTableHeader } from "./PlayerTableHeader";
import { PlayerTableRow } from "./PlayerTableRow";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerMobileCard } from "./PlayerMobileCard";

interface PlayersTableProps {
  game: Game;
  players: Player[];
  activeSeason: Season | null;
  onEliminatePlayer: (playerId: string) => void;
  onReactivatePlayer: (playerId: string) => void;
  onUpdatePlayerStats: (playerId: string, field: keyof GamePlayer, value: any) => void;
}

export default function PlayersTable({
  game,
  players,
  activeSeason,
  onEliminatePlayer,
  onReactivatePlayer,
  onUpdatePlayerStats,
}: PlayersTableProps) {
  const isMobile = useIsMobile();
  
  // Calcular o valor individual da janta
  const calculateDinnerShare = () => {
    if (!game.dinnerCost) return 0;
    const dinnerParticipants = game.players.filter(p => p.joinedDinner).length;
    if (dinnerParticipants === 0) return 0;
    return game.dinnerCost / dinnerParticipants;
  };
  
  const dinnerSharePerPlayer = calculateDinnerShare();
  
  if (isMobile) {
    return (
      <Card className="shadow-mobile">
        <CardHeader className="pb-3 mobile-card">
          <CardTitle className="flex justify-between text-lg">
            <span>Jogadores</span>
            <span className="text-poker-gold">{game.players.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="space-y-3">
            {game.players.map((gamePlayer) => {
              const player = players.find(p => p.id === gamePlayer.playerId);
              if (!player) return null;
              
              return (
                <PlayerMobileCard
                  key={gamePlayer.playerId}
                  gamePlayer={gamePlayer}
                  player={player}
                  dinnerSharePerPlayer={dinnerSharePerPlayer}
                  activeSeason={activeSeason}
                  isFinished={game.isFinished}
                  onEliminatePlayer={onEliminatePlayer}
                  onReactivatePlayer={onReactivatePlayer}
                  onUpdatePlayerStats={onUpdatePlayerStats}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-mobile">
      <CardHeader className="pb-2 mobile-card">
        <CardTitle className="flex justify-between">
          <span>Jogadores</span>
          <span className="text-poker-gold">{game.players.length} participantes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="mobile-card">
        <div className="mobile-table-container">
          <Table>
            <TableHeader>
              <PlayerTableHeader activeSeason={activeSeason} />
            </TableHeader>
            <TableBody>
              {game.players.map((gamePlayer) => {
                const player = players.find(p => p.id === gamePlayer.playerId);
                if (!player) return null;
                
                return (
                  <PlayerTableRow
                    key={gamePlayer.playerId}
                    gamePlayer={gamePlayer}
                    player={player}
                    dinnerSharePerPlayer={dinnerSharePerPlayer}
                    activeSeason={activeSeason}
                    isFinished={game.isFinished}
                    onEliminatePlayer={onEliminatePlayer}
                    onReactivatePlayer={onReactivatePlayer}
                    onUpdatePlayerStats={onUpdatePlayerStats}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
