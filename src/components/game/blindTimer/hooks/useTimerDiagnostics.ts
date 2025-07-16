import { useEffect, useCallback, useState } from "react";
import { TimerState } from "../useTimerState";

export interface TimerDiagnosticInfo {
  isOnline: boolean;
  connectionStable: boolean;
  lastContextUpdate: number;
  timerResetCount: number;
  lastResetTimestamp: number;
  performanceMetrics: {
    renderCount: number;
    avgRenderTime: number;
  };
}

export function useTimerDiagnostics(
  state: TimerState,
  blindLevels: any[],
  seasonId?: string
) {
  const [diagnostics, setDiagnostics] = useState<TimerDiagnosticInfo>({
    isOnline: navigator.onLine,
    connectionStable: true,
    lastContextUpdate: Date.now(),
    timerResetCount: 0,
    lastResetTimestamp: 0,
    performanceMetrics: {
      renderCount: 0,
      avgRenderTime: 0
    }
  });

  const [renderTimes, setRenderTimes] = useState<number[]>([]);
  const [lastLevelIndex, setLastLevelIndex] = useState<number>(0);

  // Monitorar conexão de internet
  useEffect(() => {
    const handleOnline = () => {
      setDiagnostics(prev => ({
        ...prev,
        isOnline: true,
        connectionStable: true
      }));
      console.log("🟢 Internet connection restored");
    };

    const handleOffline = () => {
      setDiagnostics(prev => ({
        ...prev,
        isOnline: false,
        connectionStable: false
      }));
      console.log("🔴 Internet connection lost");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar resets do timer
  useEffect(() => {
    if (state.currentLevelIndex < lastLevelIndex && state.elapsedTimeInLevel === 0) {
      // Possível reset detectado
      setDiagnostics(prev => ({
        ...prev,
        timerResetCount: prev.timerResetCount + 1,
        lastResetTimestamp: Date.now()
      }));
      
      console.log("⚠️ Timer reset detected!", {
        previousLevel: lastLevelIndex,
        currentLevel: state.currentLevelIndex,
        elapsedTime: state.elapsedTimeInLevel
      });
    }
    
    setLastLevelIndex(state.currentLevelIndex);
  }, [state.currentLevelIndex, state.elapsedTimeInLevel, lastLevelIndex]);

  // Monitorar performance de renderização
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setRenderTimes(prev => {
        const newTimes = [...prev, renderTime].slice(-50); // Manter apenas últimos 50
        const avg = newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length;
        
        setDiagnostics(current => ({
          ...current,
          performanceMetrics: {
            renderCount: current.performanceMetrics.renderCount + 1,
            avgRenderTime: avg
          }
        }));
        
        return newTimes;
      });
    };
  });

  // Atualizar timestamp do contexto
  useEffect(() => {
    if (seasonId && blindLevels.length > 0) {
      setDiagnostics(prev => ({
        ...prev,
        lastContextUpdate: Date.now()
      }));
    }
  }, [seasonId, blindLevels.length]);

  // Função para obter relatório completo
  const getDiagnosticReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      diagnostics,
      currentState: {
        isRunning: state.isRunning,
        currentLevelIndex: state.currentLevelIndex,
        elapsedTimeInLevel: state.elapsedTimeInLevel,
        totalElapsedTime: state.totalElapsedTime
      },
      context: {
        seasonId,
        blindLevelsCount: blindLevels.length,
        userAgent: navigator.userAgent,
        localStorage: {
          available: typeof Storage !== 'undefined',
          used: localStorage.length
        }
      }
    };

    console.log("📊 Timer Diagnostic Report:", report);
    return report;
  }, [diagnostics, state, seasonId, blindLevels.length]);

  // Função para log de evento crítico
  const logCriticalEvent = useCallback((event: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      diagnostics,
      state: {
        isRunning: state.isRunning,
        currentLevelIndex: state.currentLevelIndex,
        elapsedTimeInLevel: state.elapsedTimeInLevel
      }
    };

    console.log(`🚨 CRITICAL EVENT: ${event}`, logEntry);
    
    // Salvar no localStorage para análise posterior
    try {
      const existingLogs = JSON.parse(localStorage.getItem('timer-critical-logs') || '[]');
      existingLogs.push(logEntry);
      
      // Manter apenas últimos 20 logs
      const recentLogs = existingLogs.slice(-20);
      localStorage.setItem('timer-critical-logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error("Failed to save critical log:", error);
    }
  }, [diagnostics, state]);

  return {
    diagnostics,
    getDiagnosticReport,
    logCriticalEvent
  };
}