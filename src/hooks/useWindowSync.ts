import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { TimerState } from '@/contexts/TimerContext';

const CHANNEL_PREFIX = 'poker_timer_sync_';

export interface WindowSyncMessage {
  type: 'STATE_UPDATE' | 'MASTER_CLAIM' | 'MASTER_HEARTBEAT' | 'WINDOW_OPENED';
  gameId: string;
  windowId: string;
  timestamp: number;
  data?: any;
}

export function useWindowSync(
  gameId: string,
  state: TimerState,
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  saveState: (state: TimerState) => void
) {
  console.log('=== WINDOW SYNC - INICIALIZANDO ===');
  console.log('GameId:', gameId);

  const params = useParams();
  const location = useLocation();
  
  const channelName = `${CHANNEL_PREFIX}${gameId}`;
  const windowId = useRef(crypto.randomUUID());
  const [isMasterWindow, setIsMasterWindow] = useState(false);
  const [hasOpenedNewWindow, setHasOpenedNewWindow] = useState(false);
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);
  const heartbeatInterval = useRef<number | null>(null);
  const masterTimeout = useRef<number | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) {
      console.log('WINDOW SYNC: BroadcastChannel não suportado');
      setIsMasterWindow(true); // Fallback to single window mode
      return;
    }

    const bc = new BroadcastChannel(channelName);
    setChannel(bc);
    
    console.log('WINDOW SYNC: Canal criado:', channelName);
    console.log('WINDOW SYNC: Window ID:', windowId.current);

    // Handle incoming messages
    bc.onmessage = (event: MessageEvent<WindowSyncMessage>) => {
      const message = event.data;
      console.log('WINDOW SYNC: Mensagem recebida:', message);

      // Ignore messages from this window
      if (message.windowId === windowId.current) {
        return;
      }

      switch (message.type) {
        case 'STATE_UPDATE':
          if (message.data && !isMasterWindow) {
            console.log('WINDOW SYNC: Aplicando atualização de estado');
            setState(message.data);
          }
          break;

        case 'MASTER_CLAIM':
          if (message.timestamp > Date.now() - 1000) { // Recent claim
            console.log('WINDOW SYNC: Master reivindicado por outra janela');
            setIsMasterWindow(false);
            resetMasterTimeout();
          }
          break;

        case 'MASTER_HEARTBEAT':
          if (!isMasterWindow) {
            resetMasterTimeout();
          }
          break;

        case 'WINDOW_OPENED':
          setHasOpenedNewWindow(true);
          // Master window should send current state
          if (isMasterWindow) {
            sendMessage({
              type: 'STATE_UPDATE',
              gameId,
              windowId: windowId.current,
              timestamp: Date.now(),
              data: state
            });
          }
          break;
      }
    };

    // Claim master status initially
    claimMaster();

    return () => {
      bc.close();
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (masterTimeout.current) {
        clearTimeout(masterTimeout.current);
      }
    };
  }, [channelName, gameId]);

  // Send message through channel
  const sendMessage = useCallback((message: WindowSyncMessage) => {
    if (channel) {
      try {
        channel.postMessage(message);
        console.log('WINDOW SYNC: Mensagem enviada:', message);
      } catch (error) {
        console.error('WINDOW SYNC: Erro ao enviar mensagem:', error);
      }
    }
  }, [channel]);

  // Claim master status
  const claimMaster = useCallback(() => {
    setIsMasterWindow(true);
    console.log('WINDOW SYNC: Reivindicando status de master');
    
    sendMessage({
      type: 'MASTER_CLAIM',
      gameId,
      windowId: windowId.current,
      timestamp: Date.now()
    });

    // Start heartbeat
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    heartbeatInterval.current = window.setInterval(() => {
      sendMessage({
        type: 'MASTER_HEARTBEAT',
        gameId,
        windowId: windowId.current,
        timestamp: Date.now()
      });
    }, 2000); // Every 2 seconds
  }, [sendMessage, gameId]);

  // Reset master timeout
  const resetMasterTimeout = useCallback(() => {
    if (masterTimeout.current) {
      clearTimeout(masterTimeout.current);
    }
    
    masterTimeout.current = window.setTimeout(() => {
      console.log('WINDOW SYNC: Master timeout, reivindicando status');
      claimMaster();
    }, 5000); // 5 seconds timeout
  }, [claimMaster]);

  // Send state update
  const sendUpdate = useCallback((newState: TimerState) => {
    if (isMasterWindow) {
      sendMessage({
        type: 'STATE_UPDATE',
        gameId,
        windowId: windowId.current,
        timestamp: Date.now(),
        data: newState
      });
    }
  }, [isMasterWindow, sendMessage, gameId]);

  // Open timer in new window
  const openInNewWindow = useCallback(() => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Detect gameId from various sources
    let detectedGameId = gameId;
    
    if (!detectedGameId && params.gameId) {
      detectedGameId = params.gameId;
      console.log('WINDOW SYNC: GameId dos parâmetros:', detectedGameId);
    } else if (!detectedGameId && location.pathname.includes('/game/')) {
      const pathParts = location.pathname.split('/');
      const gameIdIndex = pathParts.findIndex(part => part === 'game') + 1;
      if (gameIdIndex < pathParts.length) {
        detectedGameId = pathParts[gameIdIndex];
        console.log('WINDOW SYNC: GameId da URL:', detectedGameId);
      }
    }
    
    if (!detectedGameId) {
      console.error('WINDOW SYNC: Game ID não encontrado');
      alert('Não foi possível identificar o jogo atual.');
      return;
    }
    
    const baseUrl = window.location.origin;
    const timerUrl = `${baseUrl}/timer/${detectedGameId}`;
    
    console.log('WINDOW SYNC: Abrindo nova janela:', timerUrl);
    
    const newWindow = window.open(
      timerUrl,
      'PokerTimer',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );
    
    if (newWindow) {
      setHasOpenedNewWindow(true);
      
      // Notify other windows
      sendMessage({
        type: 'WINDOW_OPENED',
        gameId: detectedGameId,
        windowId: windowId.current,
        timestamp: Date.now()
      });
    } else {
      alert('Não foi possível abrir a nova janela. Verifique se o bloqueador de pop-ups está desabilitado.');
    }
  }, [gameId, params.gameId, location.pathname, sendMessage]);

  // Handle window focus to potentially claim master
  useEffect(() => {
    const handleFocus = () => {
      // Try to claim master when window gets focus
      setTimeout(claimMaster, 100);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [claimMaster]);

  // Handle beforeunload to release master
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isMasterWindow && heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isMasterWindow]);

  console.log('WINDOW SYNC: Status atual - Master:', isMasterWindow, 'Opened:', hasOpenedNewWindow);

  return {
    isMasterWindow,
    hasOpenedNewWindow,
    sendUpdate,
    openInNewWindow
  };
}