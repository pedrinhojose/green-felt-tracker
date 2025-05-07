
export function useWindowControl() {
  const openInNewWindow = () => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Get the current game ID from the URL
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    let gameId = '';
    
    // Find the game ID in the URL path
    if (currentPath.includes('/partidas/')) {
      const gameIdIndex = pathParts.findIndex(part => part === 'partidas') + 1;
      if (gameIdIndex < pathParts.length) {
        gameId = pathParts[gameIdIndex];
      }
    }
    
    if (!gameId) {
      console.error('Game ID not found in URL');
      return;
    }
    
    // Corrigir a URL para usar o caminho completo com base na URL atual
    const baseUrl = window.location.origin;
    const timerUrl = `${baseUrl}/partidas/${gameId}/timer`;
    
    console.log("Opening timer in new window:", timerUrl);
    
    window.open(
      timerUrl, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
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
