
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";
import { PokerContextProps } from './types';
import { usePlayerFunctions } from './usePlayerFunctions';
import { useSeasonFunctions } from './useSeasonFunctions';
import { useRankingFunctions } from './useRankingFunctions';
import { usePokerUtils } from './usePokerUtils';
import { useGameFunctions } from './useGameFunctions';

// Create context with undefined as initial value
const PokerContext = createContext<PokerContextProps | undefined>(undefined);

export function PokerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Initialize all the hooks
  const { 
    players, setPlayers, 
    getPlayer, savePlayer, deletePlayer 
  } = usePlayerFunctions();
  
  const { 
    seasons, setSeasons, 
    activeSeason, setActiveSeason, 
    createSeason, updateSeason, endSeason 
  } = useSeasonFunctions();
  
  const { 
    rankings, setRankings, updateRankings 
  } = useRankingFunctions();
  
  const { 
    isLoading, setIsLoading, exportBackup 
  } = usePokerUtils();
  
  const { 
    games, setGames, 
    lastGame, setLastGame, 
    getGameNumber, createGame, updateGame, deleteGame, finishGame
  } = useGameFunctions(
    async () => {
      if (activeSeason) {
        console.log("Atualizando rankings após alteração de jogo...");
        await updateRankings(activeSeason.id);
      }
    },
    setActiveSeason
  );

  // Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const playersData = await pokerDB.getPlayers();
        setPlayers(playersData);
        
        const seasonsData = await pokerDB.getSeasons();
        setSeasons(seasonsData);
        
        const activeSeason = await pokerDB.getActiveSeason();
        setActiveSeason(activeSeason || null);
        
        if (activeSeason) {
          const gamesData = await pokerDB.getGames(activeSeason.id);
          setGames(gamesData);
          
          console.log("Carregando rankings para temporada ativa:", activeSeason.id);
          const rankingsData = await pokerDB.getRankings(activeSeason.id);
          setRankings(rankingsData);
        }
        
        const lastGameData = await pokerDB.getLastGame();
        setLastGame(lastGameData || null);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados. Por favor, recarregue a página.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [toast, setPlayers, setSeasons, setActiveSeason, setGames, setRankings, setLastGame, setIsLoading]);

  // Create the context value
  const contextValue: PokerContextProps = {
    // Players
    players,
    getPlayer,
    savePlayer,
    deletePlayer,
    
    // Seasons
    seasons,
    activeSeason,
    createSeason,
    updateSeason,
    endSeason,
    
    // Games
    games,
    lastGame,
    createGame,
    updateGame,
    deleteGame,
    finishGame,
    
    // Rankings
    rankings,
    
    // Utilities
    isLoading,
    exportBackup,
    getGameNumber,
  };

  return (
    <PokerContext.Provider value={contextValue}>
      {children}
    </PokerContext.Provider>
  );
}

export function usePoker() {
  const context = useContext(PokerContext);
  if (context === undefined) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
}
