
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
    
    window.open(
      `/partidas/${gameId}/timer`, 
      "PokerTimer",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  return { openInNewWindow };
}
