
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGameManagement } from "@/hooks/useGameManagement";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { usePrizeDistribution } from "@/hooks/usePrizeDistribution";

// Component imports
import BlindTimer from "@/components/game/BlindTimer";
import PlayerSelection from "@/components/game/PlayerSelection";
import PrizePoolManager from "@/components/game/PrizePoolManager";
import PlayersTable from "@/components/game/PlayersTable";
import GameHeader from "@/components/game/GameHeader";

export default function GameManagement() {
  const navigate = useNavigate();
  
  // Custom hooks for game management
  const {
    game,
    setGame,
    isLoading,
    players,
    activeSeason,
    dinnerCost,
    isSelectingPlayers,
    setIsSelectingPlayers,
    isExporting,
    isFinishing,
    handleExportReport,
    handleFinishGame,
  } = useGameManagement();
  
  // Player actions hook
  const {
    handleStartGame,
    updatePlayerStats,
    eliminatePlayer
  } = usePlayerActions(game, setGame);
  
  // Prize distribution hook
  const {
    calculateDinnerCosts,
    distributeWinningsByPrize
  } = usePrizeDistribution(game, setGame);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-poker-dark-green rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-64 bg-poker-dark-green rounded-lg max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Partida não encontrada</h2>
        <Button onClick={() => navigate('/partidas')}>Voltar para Lista de Partidas</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {!isSelectingPlayers && (
        <GameHeader
          gameNumber={game.number}
          gameDate={game.date}
          isFinished={game.isFinished}
          isExporting={isExporting}
          isFinishing={isFinishing}
          onExportReport={handleExportReport}
          onFinishGame={handleFinishGame}
        />
      )}
      
      {isSelectingPlayers ? (
        // Player selection screen
        <PlayerSelection 
          players={players} 
          onStartGame={(selectedPlayers) => {
            handleStartGame(selectedPlayers).then(success => {
              if (success) setIsSelectingPlayers(false);
            });
          }}
        />
      ) : (
        // Game management screen
        <div className="space-y-6">
          {/* Blind timer */}
          <BlindTimer />
          
          {/* Prize Pool */}
          <PrizePoolManager 
            totalPrizePool={game.totalPrizePool}
            onCalculateDinner={calculateDinnerCosts}
            onDistributePrizes={distributeWinningsByPrize}
            initialDinnerCost={dinnerCost}
          />
          
          {/* Players table */}
          <PlayersTable
            game={game}
            players={players}
            activeSeason={activeSeason}
            onEliminatePlayer={eliminatePlayer}
            onUpdatePlayerStats={updatePlayerStats}
          />
        </div>
      )}
    </div>
  );
}
