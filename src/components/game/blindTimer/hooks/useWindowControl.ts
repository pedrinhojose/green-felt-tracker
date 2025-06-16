
import { useParams, useLocation } from "react-router-dom";
import { usePoker } from "@/contexts/PokerContext";

export function useWindowControl() {
  const params = useParams();
  const location = useLocation();
  const { lastGame } = usePoker();
  
  const openInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Detectar o gameId de várias fontes possíveis
    let gameId = '';
    
    // 1. Tentar pegar da URL atual (se estiver na página do jogo)
    if (params.gameId) {
      gameId = params.gameId;
      console.log("GameId encontrado nos parâmetros da URL:", gameId);
    }
    // 2. Tentar extrair da URL atual se contém um gameId
    else if (location.pathname.includes('/game/')) {
      const pathParts = location.pathname.split('/');
      const gameIdIndex = pathParts.findIndex(part => part === 'game') + 1;
      if (gameIdIndex < pathParts.length) {
        gameId = pathParts[gameIdIndex];
        console.log("GameId extraído da URL do jogo:", gameId);
      }
    }
    // 3. Usar o último jogo como fallback
    else if (lastGame?.id) {
      gameId = lastGame.id;
      console.log("Usando último jogo como fallback:", gameId);
    }
    
    if (!gameId) {
      console.error('Game ID não encontrado - não é possível abrir o timer');
      alert('Não foi possível identificar o jogo atual. Certifique-se de estar visualizando um jogo específico.');
      return;
    }
    
    // Construir a URL correta para o timer
    const baseUrl = window.location.origin;
    const timerUrl = `${baseUrl}/timer/${gameId}`;
    
    console.log("Abrindo timer em nova janela:", timerUrl);
    
    const newWindow = window.open(
      timerUrl, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );
    
    if (!newWindow) {
      alert('Não foi possível abrir a nova janela. Verifique se o bloqueador de pop-ups está desabilitado.');
    }
  };

  // Função para alternar modo tela cheia
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Se não estiver em tela cheia, entre no modo tela cheia
      const timerContainer = document.querySelector('.timer-container') || document.documentElement;
      
      if (timerContainer.requestFullscreen) {
        timerContainer.requestFullscreen().catch(err => {
          console.error(`Erro ao tentar entrar no modo tela cheia: ${err.message}`);
        });
      }
    } else {
      // Se já estiver em tela cheia, saia do modo
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Erro ao tentar sair do modo tela cheia: ${err.message}`);
        });
      }
    }
  };

  return { openInNewWindow, toggleFullScreen };
}
