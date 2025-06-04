
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, GamePlayer, Player, Season } from "@/lib/db/models";
import { PlayerTableHeader } from "./PlayerTableHeader";
import { PlayerTableRow } from "./PlayerTableRow";
import { Table, TableBody, TableHeader } from "@/components/ui/table";

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
  
  // Calcular o valor individual da janta
  const calculateDinnerShare = () => {
    if (!game.dinnerCost) return 0;
    const dinnerParticipants = game.players.filter(p => p.joinedDinner).length;
    if (dinnerParticipants === 0) return 0;
    return game.dinnerCost / dinnerParticipants;
  };
  
  const dinnerSharePerPlayer = calculateDinnerShare();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between">
          <span>Jogadores</span>
          <span>{game.players.length} participantes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
