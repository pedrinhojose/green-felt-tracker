import { useEffect, useCallback } from "react";
import { TimerState } from "../useTimerState";

const TIMER_STORAGE_KEY = 'poker-timer-state';
const TIMER_BACKUP_KEY = 'poker-timer-backup';

export interface PersistedTimerState {
  state: TimerState;
  timestamp: number;
  seasonId: string;
  gameId?: string;
  blindLevelsHash: string;
}

export function useTimerPersistence(
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  seasonId: string,
  gameId?: string,
  blindLevelsHash?: string
) {
  // Salvar estado no localStorage a cada mudança
  useEffect(() => {
    if (!seasonId || !blindLevelsHash) return;

    const persistedState: PersistedTimerState = {
      state,
      timestamp: Date.now(),
      seasonId,
      gameId,
      blindLevelsHash
    };

    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persistedState));
      console.log("🔄 Timer state persisted:", persistedState);
    } catch (error) {
      console.error("❌ Failed to persist timer state:", error);
    }
  }, [state, seasonId, gameId, blindLevelsHash]);

  // Recuperar estado salvo
  const recoverTimerState = useCallback(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!saved) return null;

      const persistedState: PersistedTimerState = JSON.parse(saved);
      
      // Verificar se é da mesma temporada e estrutura de blinds
      if (persistedState.seasonId !== seasonId || 
          persistedState.blindLevelsHash !== blindLevelsHash) {
        console.log("⚠️ Saved state is from different season/blinds, ignoring");
        return null;
      }

      // Verificar se não é muito antigo (mais de 1 hora)
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (persistedState.timestamp < hourAgo) {
        console.log("⚠️ Saved state is too old, ignoring");
        return null;
      }

      console.log("✅ Valid saved state found:", persistedState);
      return persistedState;
    } catch (error) {
      console.error("❌ Failed to recover timer state:", error);
      return null;
    }
  }, [seasonId, blindLevelsHash]);

  // Criar backup antes de mudanças críticas
  const createBackup = useCallback(() => {
    try {
      const currentSaved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (currentSaved) {
        localStorage.setItem(TIMER_BACKUP_KEY, currentSaved);
        console.log("📁 Timer backup created");
      }
    } catch (error) {
      console.error("❌ Failed to create backup:", error);
    }
  }, []);

  // Restaurar do backup
  const restoreFromBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(TIMER_BACKUP_KEY);
      if (!backup) return false;

      const persistedState: PersistedTimerState = JSON.parse(backup);
      
      // Verificar se é da mesma temporada
      if (persistedState.seasonId !== seasonId) {
        console.log("⚠️ Backup is from different season, ignoring");
        return false;
      }

      setState(persistedState.state);
      console.log("🔄 Timer restored from backup:", persistedState);
      return true;
    } catch (error) {
      console.error("❌ Failed to restore from backup:", error);
      return false;
    }
  }, [seasonId, setState]);

  // Limpar dados persistidos
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
      localStorage.removeItem(TIMER_BACKUP_KEY);
      console.log("🗑️ Persisted timer data cleared");
    } catch (error) {
      console.error("❌ Failed to clear persisted data:", error);
    }
  }, []);

  // Verificar se existe estado salvo
  const hasSavedState = useCallback(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    return saved !== null;
  }, []);

  return {
    recoverTimerState,
    createBackup,
    restoreFromBackup,
    clearPersistedData,
    hasSavedState
  };
}

// Utilidade para gerar hash dos blind levels
export function generateBlindLevelsHash(blindLevels: any[]): string {
  if (!Array.isArray(blindLevels)) return '';
  
  try {
    const simplified = blindLevels.map(level => ({
      level: level.level,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      duration: level.duration,
      isBreak: level.isBreak
    }));
    
    return btoa(JSON.stringify(simplified));
  } catch (error) {
    console.error("Failed to generate blind levels hash:", error);
    return '';
  }
}