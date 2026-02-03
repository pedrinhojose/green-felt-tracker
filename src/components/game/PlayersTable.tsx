import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, GamePlayer, Player, Season } from "@/lib/db/models";
import { PlayerTableHeader } from "./PlayerTableHeader";
import { PlayerTableRow } from "./PlayerTableRow";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerMobileCard } from "./PlayerMobileCard";
import { useState } from "react";
import { SwapPositionDialog } from "./SwapPositionDialog";

interface PlayersTableProps {
  game: Game;
  players: Player[];
  activeSeason: Season | null;
  onEliminatePlayer: (playerId: string) => void;
  onReactivatePlayer: (playerId: string) => void;
  onUpdatePlayerStats: (playerId: string, field: keyof GamePlayer, value: any) => void;
  onSwapPositions?: (player1Id: string, player2Id: string) => Promise<boolean>;
  isEditingFinishedGame?: boolean;
}

export default function PlayersTable({
  game,
  players,
  activeSeason,
  onEliminatePlayer,
  onReactivatePlayer,
  onUpdatePlayerStats,
  onSwapPositions,
  isEditingFinishedGame = false,
}: PlayersTableProps) {
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [playerToSwap, setPlayerToSwap] = useState<GamePlayer | null>(null);

  // Jogadores com posição definida para o swap
  const playersWithPosition = game.players.filter(p => p.position !== null && p.isEliminated);

  const handleOpenSwapDialog = (playerId: string) => {
    const gamePlayer = game.players.find(p => p.playerId === playerId);
    if (gamePlayer) {
      setPlayerToSwap(gamePlayer);
      setIsSwapDialogOpen(true);
    }
  };

  const handleConfirmSwap = async (player1Id: string, player2Id: string) => {
    if (onSwapPositions) {
      return await onSwapPositions(player1Id, player2Id);
    }
    return false;
  };

  // Verificar se pode trocar posição (jogador eliminado e partida não finalizada ou em edição)
  const canSwapPosition = (gamePlayer: GamePlayer) => {
    return gamePlayer.isEliminated && 
           gamePlayer.position !== null && 
           (!game.isFinished || isEditingFinishedGame) &&
           playersWithPosition.length > 1 &&
           onSwapPositions !== undefined;
  };
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
      <>
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
                      isFinished={game.isFinished && !isEditingFinishedGame}
                      onEliminatePlayer={onEliminatePlayer}
                      onReactivatePlayer={onReactivatePlayer}
                      onUpdatePlayerStats={onUpdatePlayerStats}
                      onSwapPosition={canSwapPosition(gamePlayer) ? handleOpenSwapDialog : undefined}
                    />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <SwapPositionDialog
          open={isSwapDialogOpen}
          onOpenChange={setIsSwapDialogOpen}
          selectedPlayer={playerToSwap}
          playersWithPosition={playersWithPosition}
          allPlayers={players}
          onConfirmSwap={handleConfirmSwap}
        />
      </>
    );
  }
  
  return (
    <>
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
                      isFinished={game.isFinished && !isEditingFinishedGame}
                      onEliminatePlayer={onEliminatePlayer}
                      onReactivatePlayer={onReactivatePlayer}
                      onUpdatePlayerStats={onUpdatePlayerStats}
                      onSwapPosition={canSwapPosition(gamePlayer) ? handleOpenSwapDialog : undefined}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SwapPositionDialog
        open={isSwapDialogOpen}
        onOpenChange={setIsSwapDialogOpen}
        selectedPlayer={playerToSwap}
        playersWithPosition={playersWithPosition}
        allPlayers={players}
        onConfirmSwap={handleConfirmSwap}
      />
    </>
  );
}
