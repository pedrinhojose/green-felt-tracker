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

    console.log("=== PERSISTENCE - SALVANDO ESTADO ===");
    console.log("Estado sendo persistido:", state);

    const persistedState: PersistedTimerState = {
      state,
      timestamp: Date.now(),
      seasonId,
      gameId,
      blindLevelsHash
    };

    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persistedState));
      console.log("✅ Estado persistido com sucesso");
    } catch (error) {
      console.error("❌ Erro ao persistir estado:", error);
    }
  }, [state, seasonId, gameId, blindLevelsHash]);

  // Recuperar estado salvo
  const recoverTimerState = useCallback(() => {
    console.log("=== PERSISTENCE - RECUPERANDO ESTADO ===");
    
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!saved) {
        console.log("Nenhum estado salvo encontrado");
        return null;
      }

      const persistedState: PersistedTimerState = JSON.parse(saved);
      console.log("Estado recuperado:", persistedState);
      
      // Verificar se é da mesma temporada e estrutura de blinds
      if (persistedState.seasonId !== seasonId || 
          persistedState.blindLevelsHash !== blindLevelsHash) {
        console.log("⚠️ Estado é de temporada/blinds diferente, ignorando");
        console.log("Saved:", { seasonId: persistedState.seasonId, hash: persistedState.blindLevelsHash });
        console.log("Current:", { seasonId, blindLevelsHash });
        return null;
      }

      // Verificar se não é muito antigo (mais de 1 hora)
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (persistedState.timestamp < hourAgo) {
        console.log("⚠️ Estado muito antigo, ignorando");
        return null;
      }

      // Validar estrutura do estado
      if (!persistedState.state || typeof persistedState.state.currentLevelIndex !== 'number') {
        console.log("⚠️ Estado corrompido, limpando dados");
        localStorage.removeItem(TIMER_STORAGE_KEY);
        return null;
      }

      console.log("✅ Estado válido encontrado:", persistedState);
      return persistedState;
    } catch (error) {
      console.error("❌ Erro ao recuperar estado:", error);
      // Limpar dados corrompidos
      localStorage.removeItem(TIMER_STORAGE_KEY);
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