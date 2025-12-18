
import { Game, Player, Season, RankingEntry } from "@/lib/db/models";

export interface PokerContextProps {
  // Players
  players: Player[];
  getPlayer: (id: string) => Promise<Player | undefined>; // Changed to Promise<Player | undefined>
  savePlayer: (player: Partial<Player>) => Promise<string>; // Changed to accept Partial<Player>
  deletePlayer: (id: string) => Promise<void>;
  
  // Seasons
  seasons: Season[];
  activeSeason: Season | null;
  createSeason: (seasonData: Partial<Season>) => Promise<string>;
  updateSeason: (seasonData: Partial<Season>) => Promise<void>;
  endSeason: (seasonId: string) => Promise<void>;
  recalculateSeasonJackpot: (seasonId: string) => Promise<number>;
  fixSeasonJackpot: (seasonId: string, setActiveSeason?: React.Dispatch<React.SetStateAction<Season | null>>) => Promise<Season>;
  setCaixinhaBalance: (seasonId: string, balance: number) => Promise<void>;
  
  // Games
  games: Game[];
  lastGame: Game | null;
  createGame: (seasonId: string) => Promise<string>;
  updateGame: (gameData: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<boolean>;
  finishGame: (gameId: string) => Promise<void>;
  
  // Rankings
  rankings: RankingEntry[];
  
  // Utilities
  isLoading: boolean;
  exportBackup: () => Promise<void>;
  importBackup: (backupJson: string) => Promise<void>;
  getGameNumber: (seasonId: string) => Promise<number>;
}
