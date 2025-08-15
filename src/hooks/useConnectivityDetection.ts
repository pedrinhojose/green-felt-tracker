import { useState, useCallback, useEffect } from 'react';
import { TimerState } from '@/contexts/TimerContext';
import { useToast } from '@/components/ui/use-toast';

export function useConnectivityDetection(
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>
) {
  console.log('=== CONNECTIVITY DETECTION - INICIALIZANDO ===');

  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [wasRunningBeforeOffline, setWasRunningBeforeOffline] = useState(false);

  // Handle online/offline events
  const handleOnline = useCallback(() => {
    console.log('CONNECTIVITY: Voltou online');
    setIsOnline(true);
    setIsEmergencyMode(false);
    
    setState(prev => ({ ...prev, isOnline: true }));
    
    toast({
      title: "Conexão restaurada",
      description: "A conexão com a internet foi restaurada.",
      variant: "default",
    });

    // Ask user if they want to resume timer
    if (wasRunningBeforeOffline && !state.isRunning) {
      const shouldResume = confirm(
        "O timer foi pausado devido à perda de conexão. Deseja retomar o timer?"
      );
      
      if (shouldResume) {
        console.log('CONNECTIVITY: Retomando timer após reconexão');
        // This will be handled by the TimerContext
      }
      
      setWasRunningBeforeOffline(false);
    }
  }, [setState, toast, wasRunningBeforeOffline, state.isRunning]);

  const handleOffline = useCallback(() => {
    console.log('CONNECTIVITY: Ficou offline');
    setIsOnline(false);
    setIsEmergencyMode(true);
    
    // Remember if timer was running
    if (state.isRunning) {
      setWasRunningBeforeOffline(true);
    }
    
    setState(prev => ({ ...prev, isOnline: false }));
    
    toast({
      title: "Conexão perdida",
      description: "A conexão com a internet foi perdida. O timer entrará em modo de emergência.",
      variant: "destructive",
    });
    
    console.log('CONNECTIVITY: Ativando modo de emergência');
  }, [setState, toast, state.isRunning]);

  // Handle connection change events
  const handleConnectionChange = useCallback(() => {
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }
  }, [handleOnline, handleOffline]);

  // Monitor connection status
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic connectivity check
    const interval = setInterval(() => {
      const currentOnlineStatus = navigator.onLine;
      
      if (currentOnlineStatus !== isOnline) {
        console.log('CONNECTIVITY: Status mudou detectado via polling');
        handleConnectionChange();
      }
      
      // Additional check with a small request
      if (currentOnlineStatus) {
        fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        })
        .then(() => {
          if (!isOnline) {
            console.log('CONNECTIVITY: Conectividade confirmada via request');
            handleOnline();
          }
        })
        .catch(() => {
          if (isOnline) {
            console.log('CONNECTIVITY: Perda de conectividade detectada via request');
            handleOffline();
          }
        });
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [handleOnline, handleOffline, handleConnectionChange, isOnline]);

  // Monitor for rapid connection changes (potentially unstable connection)
  useEffect(() => {
    let connectionChanges = 0;
    const resetInterval = setTimeout(() => {
      connectionChanges = 0;
    }, 30000); // Reset counter every 30 seconds
    
    const trackChanges = () => {
      connectionChanges++;
      
      if (connectionChanges > 3) { // More than 3 changes in 30 seconds
        console.log('CONNECTIVITY: Conexão instável detectada');
        setIsEmergencyMode(true);
        
        toast({
          title: "Conexão instável",
          description: "Conexão instável detectada. Timer em modo de emergência para evitar problemas.",
          variant: "destructive",
        });
      }
    };
    
    window.addEventListener('online', trackChanges);
    window.addEventListener('offline', trackChanges);
    
    return () => {
      window.removeEventListener('online', trackChanges);
      window.removeEventListener('offline', trackChanges);
      clearTimeout(resetInterval);
    };
  }, [toast]);

  // Log connectivity status changes
  useEffect(() => {
    console.log('CONNECTIVITY: Status atualizado - Online:', isOnline, 'Emergency:', isEmergencyMode);
  }, [isOnline, isEmergencyMode]);

  return {
    isOnline,
    isEmergencyMode,
    handleConnectionChange,
    wasRunningBeforeOffline
  };
}