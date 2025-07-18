import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGameManagement } from "@/hooks/useGameManagement";
import { usePlayerActions } from "@/hooks/usePlayerActions";
import { usePrizeDistribution } from "@/hooks/usePrizeDistribution";
import { useGameShareableLink } from "@/hooks/useGameShareableLink";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Component imports
import BlindTimer from "@/components/game/blindTimer/BlindTimer"; 
import PlayerSelection from "@/components/game/PlayerSelection";
import PrizePoolManager from "@/components/game/PrizePoolManager";
import PlayersTable from "@/components/game/PlayersTable";
import GameHeader from "@/components/game/GameHeader";
import { AddLatePlayerDialog } from "@/components/game/AddLatePlayerDialog";
import { RemovePlayerDialog } from "@/components/game/RemovePlayerDialog";
import { UserPlus, UserMinus } from "lucide-react";

export default function GameManagement() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isRemovingPlayer, setIsRemovingPlayer] = useState(false);
  
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
    isExportingImage,
    isFinishing,
    isDeleting,
    handleExportReport,
    handleExportReportAsImage,
    handleFinishGame,
    handleDeleteGame,
  } = useGameManagement();
  
  // Player actions hook
  const {
    handleStartGame,
    updatePlayerStats,
    eliminatePlayer,
    reactivatePlayer,
    addLatePlayer,
    removePlayer
  } = usePlayerActions(game, setGame);
  
  // Prize distribution hook
  const {
    calculateDinnerCosts,
    distributeWinningsByPrize
  } = usePrizeDistribution(game, setGame);
  
  // Game shareable link hook
  const { generateShareableLink, isGenerating: isGeneratingLink } = useGameShareableLink();
  
  // Filtrar jogadores que ainda não estão na partida
  const getAvailablePlayers = () => {
    if (!game || !players) return [];
    
    const currentPlayerIds = new Set(game.players.map(p => p.playerId));
    return players.filter(player => !currentPlayerIds.has(player.id));
  };
  
  // Verificar se há jogadores que podem ser removidos
  const getRemovablePlayers = () => {
    if (!game) return [];
    return game.players.filter(gp => !gp.isEliminated && gp.prize === 0);
  };
  
  // Handler para adicionar jogador tardio
  const handleAddLatePlayer = async (playerId: string) => {
    setIsAddingPlayer(true);
    try {
      await addLatePlayer(playerId);
    } finally {
      setIsAddingPlayer(false);
    }
  };
  
  // Handler para remover jogador
  const handleRemovePlayer = async (playerId: string) => {
    setIsRemovingPlayer(true);
    try {
      return await removePlayer(playerId);
    } finally {
      setIsRemovingPlayer(false);
    }
  };
  
  // Handler para exportar link
  const handleExportLink = async () => {
    if (game?.id) {
      await generateShareableLink(game.id);
    }
  };
  
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
        <Button onClick={() => navigate('/games')}>Voltar para Lista de Partidas</Button>
      </div>
    );
  }

  return (
    <div className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
      {!isSelectingPlayers && (
        <GameHeader
          gameNumber={game.number}
          gameDate={game.date}
          isFinished={game.isFinished}
          isExporting={isExporting}
          isExportingImage={isExportingImage}
          isFinishing={isFinishing}
          isDeleting={isDeleting}
          isGeneratingLink={isGeneratingLink}
          onExportReport={handleExportReport}
          onExportReportAsImage={handleExportReportAsImage}
          onExportLink={handleExportLink}
          onFinishGame={handleFinishGame}
          onDeleteGame={handleDeleteGame}
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
        <div className={`space-y-${isMobile ? '4' : '6'}`}>
          {/* Blind Timer */}
          <BlindTimer />
          
          {/* Prize Pool e Botões de Gerenciar Jogadores */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col lg:flex-row'} justify-between items-start gap-4`}>
            <div className="w-full">
              <PrizePoolManager 
                totalPrizePool={game.totalPrizePool}
                onCalculateDinner={calculateDinnerCosts}
                onDistributePrizes={distributeWinningsByPrize}
                initialDinnerCost={dinnerCost}
                game={game}
                players={players}
                activeSeason={activeSeason}
              />
            </div>
            
            {/* Botões para gerenciar jogadores */}
            {!game.isFinished && (
              <div className={`flex ${isMobile ? 'w-full flex-col' : 'flex-row'} gap-2 ${isMobile ? 'mt-2' : 'mt-2 lg:mt-0'}`}>
                <Button 
                  onClick={() => setIsAddPlayerDialogOpen(true)}
                  disabled={getAvailablePlayers().length === 0}
                  className={`${isMobile ? 'w-full' : ''} bg-poker-gold hover:bg-poker-gold/80 text-black`}
                  variant="outline"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Jogador
                </Button>
                
                <Button 
                  onClick={() => setIsRemovePlayerDialogOpen(true)}
                  disabled={getRemovablePlayers().length === 0}
                  className={`${isMobile ? 'w-full' : ''}`}
                  variant="destructive"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Retirar Jogador
                </Button>
              </div>
            )}
          </div>
          
          {/* Players table */}
          <PlayersTable
            game={game}
            players={players}
            activeSeason={activeSeason}
            onEliminatePlayer={eliminatePlayer}
            onReactivatePlayer={reactivatePlayer}
            onUpdatePlayerStats={updatePlayerStats}
          />
          
          {/* Dialog para adicionar jogador tardio */}
          <AddLatePlayerDialog
            isOpen={isAddPlayerDialogOpen}
            onClose={() => setIsAddPlayerDialogOpen(false)}
            onAddPlayer={handleAddLatePlayer}
            availablePlayers={getAvailablePlayers()}
            isLoading={isAddingPlayer}
          />
          
          {/* Dialog para remover jogador */}
          <RemovePlayerDialog
            isOpen={isRemovePlayerDialogOpen}
            onClose={() => setIsRemovePlayerDialogOpen(false)}
            onRemovePlayer={handleRemovePlayer}
            game={game}
            players={players}
            isLoading={isRemovingPlayer}
          />
        </div>
      )}
    </div>
  );
}
