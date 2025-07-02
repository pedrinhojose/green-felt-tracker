
import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { useGameLoader } from "./game-management/useGameLoader";
import { useGameExport } from "./game-management/useGameExport";
import { useGameActions } from "./game-management/useGameActions";

export function useGameManagement() {
  const { players, activeSeason, updateGame } = usePoker();
  const [dinnerCost, setDinnerCost] = useState<number>(0);
  const [isSelectingPlayers, setIsSelectingPlayers] = useState(false);
  
  // Use the separated hooks
  const { game, setGame, isLoading } = useGameLoader();
  const { isExporting, isExportingImage, handleExportReport, handleExportReportAsImage } = useGameExport(game, players);
  const { isFinishing, isDeleting, handleFinishGame, handleDeleteGame } = useGameActions(game, setGame);
  
  // Initialize dinner cost and player selection state when game loads
  if (game && dinnerCost === 0 && game.dinnerCost) {
    setDinnerCost(game.dinnerCost);
  }
  
  if (game && !isSelectingPlayers && game.players.length === 0) {
    setIsSelectingPlayers(true);
  }

  return {
    game,
    setGame,
    isLoading,
    players,
    activeSeason,
    updateGame,
    dinnerCost,
    setDinnerCost,
    isSelectingPlayers,
    setIsSelectingPlayers,
    isExporting,
    isExportingImage,
    handleExportReport,
    handleExportReportAsImage,
    isFinishing,
    handleFinishGame,
    isDeleting,
    handleDeleteGame,
  };
}
