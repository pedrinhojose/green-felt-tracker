
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { pokerDB } from '../lib/db';
import { useToast } from "@/components/ui/use-toast";
import { PokerContextProps } from './types';
import { usePlayerFunctions } from './usePlayerFunctions';
import { useSeasonFunctions } from './useSeasonFunctions';
import { useRankingFunctions } from './useRankingFunctions';
import { usePokerUtils } from './usePokerUtils';
import { useGameFunctions } from './useGameFunctions';
import { useOrganization } from './OrganizationContext';

// Create context with undefined as initial value
const PokerContext = createContext<PokerContextProps | undefined>(undefined);

export function PokerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  
  console.log("PokerProvider: Renderizando com organização:", currentOrganization?.name || 'nenhuma', "orgLoading:", orgLoading);
  
  // Initialize all the hooks
  const { 
    players, setPlayers, 
    getPlayer, savePlayer, deactivatePlayer, reactivatePlayer 
  } = usePlayerFunctions();
  
  const { 
    seasons, setSeasons, 
    activeSeason, setActiveSeason, 
    createSeason, updateSeason, endSeason,
    recalculateSeasonJackpot, fixSeasonJackpot, setCaixinhaBalance
  } = useSeasonFunctions();
  
  const { 
    rankings, setRankings, updateRankings 
  } = useRankingFunctions();
  
  const { 
    isLoading, setIsLoading, exportBackup, importBackup 
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

  // Load initial data when organization changes
  useEffect(() => {
    const initData = async () => {
      if (!currentOrganization) {
        console.log("PokerContext: Nenhuma organização selecionada, limpando dados");
        setPlayers([]);
        setSeasons([]);
        setActiveSeason(null);
        setGames([]);
        setRankings([]);
        setLastGame(null);
        return;
      }

      try {
        console.log("PokerContext: Inicializando dados para organização:", currentOrganization.id, currentOrganization.name);
        setIsLoading(true);
        
        // Load players
        console.log("PokerContext: Carregando jogadores...");
        const playersData = await pokerDB.getPlayers();
        console.log("PokerContext: Jogadores carregados:", playersData.length);
        setPlayers(playersData);
        
        // Load seasons
        console.log("PokerContext: Carregando temporadas...");
        const seasonsData = await pokerDB.getSeasons();
        console.log("PokerContext: Temporadas carregadas:", seasonsData.length);
        setSeasons(seasonsData);
        
        // Load active season
        console.log("PokerContext: Carregando temporada ativa...");
        const activeSeasonData = await pokerDB.getActiveSeason();
        console.log("PokerContext: Temporada ativa:", activeSeasonData?.id || 'nenhuma');
        setActiveSeason(activeSeasonData || null);
        
        if (activeSeasonData) {
          // Load games for active season
          console.log("PokerContext: Carregando jogos para temporada ativa:", activeSeasonData.id);
          const gamesData = await pokerDB.getGames(activeSeasonData.id);
          console.log("PokerContext: Jogos carregados:", gamesData.length);
          setGames(gamesData);
          
          // Load rankings for active season
          console.log("PokerContext: Carregando rankings para temporada ativa:", activeSeasonData.id);
          const rankingsData = await pokerDB.getRankings(activeSeasonData.id);
          console.log("PokerContext: Rankings carregados:", rankingsData.length);
          setRankings(rankingsData);
        } else {
          console.log("PokerContext: Nenhuma temporada ativa, limpando jogos e rankings");
          setGames([]);
          setRankings([]);
        }
        
        // Load last game
        console.log("PokerContext: Carregando último jogo...");
        const lastGameData = await pokerDB.getLastGame();
        console.log("PokerContext: Último jogo:", lastGameData?.id || 'nenhum');
        setLastGame(lastGameData || null);
        
        console.log("PokerContext: Inicialização concluída com sucesso");
      } catch (error) {
        console.error('PokerContext: Erro ao inicializar dados:', error);
        // Don't show toast error for network issues - they are temporary
        if (error instanceof Error && !error.message.includes('Load failed')) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados. Verifique se você tem acesso à organização selecionada.",
            variant: "destructive",
          });
        } else {
          console.log("PokerContext: Erro de rede detectado, tentando novamente em breve...");
        }
        
        // Set default empty state on error
        setPlayers([]);
        setSeasons([]);
        setActiveSeason(null);
        setGames([]);
        setRankings([]);
        setLastGame(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, [currentOrganization, toast, setPlayers, setSeasons, setActiveSeason, setGames, setRankings, setLastGame, setIsLoading]);

  // Create the context value
  const contextValue: PokerContextProps = {
    // Players
    players,
    getPlayer,
    savePlayer,
    deactivatePlayer,
    reactivatePlayer,
    
    // Seasons
    seasons,
    activeSeason,
    createSeason,
    updateSeason,
    endSeason,
    recalculateSeasonJackpot,
    fixSeasonJackpot,
    setCaixinhaBalance,
    
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
    importBackup,
    getGameNumber,
  };

  console.log("PokerProvider: Fornecendo contexto com dados:", {
    players: players.length,
    seasons: seasons.length,
    activeSeason: activeSeason?.name || 'nenhuma',
    games: games.length
  });

  // Always provide context, but with empty state while org is loading
  if (orgLoading) {
    console.log("PokerProvider: Organização carregando, fornecendo contexto vazio...");
    const emptyContextValue: PokerContextProps = {
      // Players
      players: [],
      getPlayer: async () => undefined,
      savePlayer: async () => '',
      deactivatePlayer: async () => {},
      reactivatePlayer: async () => {},
      
      // Seasons
      seasons: [],
      activeSeason: null,
      createSeason: async () => '',
      updateSeason: async () => {},
      endSeason: async () => {},
      recalculateSeasonJackpot: async () => 0,
      fixSeasonJackpot: async () => ({} as any),
      setCaixinhaBalance: async () => {},
      
      // Games
      games: [],
      lastGame: null,
      createGame: async () => '',
      updateGame: async () => {},
      deleteGame: async () => false,
      finishGame: async () => {},
      
      // Rankings
      rankings: [],
      
      // Utilities
      isLoading: true,
      exportBackup: async () => {},
      importBackup: async () => {},
      getGameNumber: async () => 1,
    };
    
    return (
      <PokerContext.Provider value={emptyContextValue}>
        {children}
      </PokerContext.Provider>
    );
  }

  return (
    <PokerContext.Provider value={contextValue}>
      {children}
    </PokerContext.Provider>
  );
}

export function usePoker() {
  console.log("usePoker: Tentando acessar contexto...");
  const context = useContext(PokerContext);
  
  if (context === undefined) {
    console.error('usePoker: Contexto não encontrado! Componente não está dentro do PokerProvider');
    console.trace('Stack trace do erro usePoker');
    throw new Error('usePoker must be used within a PokerProvider');
  }
  
  console.log("usePoker: Contexto acessado com sucesso");
  return context;
}
