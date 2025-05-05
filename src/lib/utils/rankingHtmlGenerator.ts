/**
 * Utility functions for generating HTML elements for the ranking export
 */

/**
 * Creates the title and header section of the ranking export
 * @param activeSeason The currently active season object
 * @returns HTML header elements with title and season information
 */
export const createRankingHeader = (activeSeason: any | null) => {
  // Create header container
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.flexDirection = 'column';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  header.style.padding = '10px';
  
  // Título principal "Ranking de Pontos"
  const title = document.createElement('h2');
  title.textContent = 'Ranking de Pontos';
  title.style.fontSize = '26px';
  title.style.fontWeight = 'bold';
  title.style.color = '#D4AF37'; // Cor dourada
  title.style.margin = '0 0 10px 0';
  
  // Season information
  if (activeSeason) {
    const seasonInfo = document.createElement('div');
    seasonInfo.textContent = `Temporada: ${activeSeason.name}`;
    seasonInfo.style.color = '#ffffff';
    seasonInfo.style.fontSize = '14px';
    seasonInfo.style.margin = '2px 0';
    header.appendChild(seasonInfo);
    
    // Game number info if available
    if (activeSeason.currentGameNumber) {
      const gameInfo = document.createElement('div');
      gameInfo.textContent = `Partida #${activeSeason.currentGameNumber}`;
      gameInfo.style.color = '#ffffff';
      gameInfo.style.fontSize = '14px';
      gameInfo.style.margin = '2px 0';
      header.appendChild(gameInfo);
    }
  }
  
  // Data atual
  const dateElement = document.createElement('div');
  dateElement.textContent = new Date().toLocaleDateString('pt-BR');
  dateElement.style.color = '#ffffff';
  dateElement.style.fontSize = '16px';
  dateElement.style.marginTop = '5px';
  
  header.appendChild(title);
  // Date is now appended after the season/game info
  header.appendChild(dateElement);
  
  return header;
};

/**
 * Creates a styled container for the ranking export
 * @returns A div element styled for the ranking export
 */
export const createRankingContainer = () => {
  const exportDiv = document.createElement('div');
  exportDiv.id = 'ranking-export';
  exportDiv.style.padding = '20px';
  exportDiv.style.backgroundColor = '#111827'; // Fundo escuro como na imagem
  exportDiv.style.borderRadius = '12px';
  exportDiv.style.width = '100%';
  exportDiv.style.maxWidth = '500px';  // Largura ideal para visualização
  exportDiv.style.margin = '0 auto';
  exportDiv.style.overflow = 'hidden';
  exportDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  return exportDiv;
};

/**
 * Creates the table header for the ranking export
 * @returns A thead element with styled headers
 */
export const createTableHeader = () => {
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.borderBottom = '1px solid #2D3748';
  
  // Cabeçalhos conforme a imagem: Pos., Jogador, Pontos, Partidas
  const headers = ['Pos.', 'Jogador', 'Pontos', 'Partidas'];
  const columnWidths = ['60px', '1fr', '100px', '100px'];
  
  headers.forEach((headerText, index) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '8px 16px';
    th.style.textAlign = index === 1 ? 'left' : 'center';
    th.style.fontSize = '16px';
    th.style.fontWeight = 'bold';
    th.style.color = '#ffffff';
    
    if (index === 0) {
      th.style.width = columnWidths[0];
    } else if (index === 1) {
      th.style.width = columnWidths[1];
    } else {
      th.style.width = columnWidths[index];
    }
    
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  return thead;
};

/**
 * Creates a player avatar element (either image or initials)
 * @param ranking The ranking entry containing player data
 * @param getInitials Function to get player initials from name
 * @returns A styled div element with player avatar
 */
export const createPlayerAvatar = (ranking: any, getInitials: (name: string) => string) => {
  const avatarDiv = document.createElement('div');
  avatarDiv.style.width = '32px';
  avatarDiv.style.height = '32px';
  avatarDiv.style.borderRadius = '50%';
  avatarDiv.style.backgroundColor = '#1e3a8a';
  avatarDiv.style.color = 'white';
  avatarDiv.style.display = 'flex';
  avatarDiv.style.alignItems = 'center';
  avatarDiv.style.justifyContent = 'center';
  avatarDiv.style.fontSize = '14px';
  avatarDiv.style.fontWeight = 'bold';
  avatarDiv.style.flexShrink = '0';
  avatarDiv.style.border = '1px solid #2D3748';
  
  if (ranking.photoUrl) {
    const img = document.createElement('img');
    img.src = ranking.photoUrl;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    avatarDiv.appendChild(img);
  } else {
    avatarDiv.textContent = getInitials(ranking.playerName);
  }
  
  return avatarDiv;
};

/**
 * Creates a position number element for ranking display
 * @param index The player's position in the ranking (zero-based)
 * @returns A styled span element with position number
 */
export const createPositionNumber = (index: number) => {
  const position = document.createElement('div');
  position.textContent = (index + 1).toString();
  position.style.fontSize = '18px';
  position.style.fontWeight = 'bold';
  position.style.color = '#ffffff';
  position.style.textAlign = 'center';
  
  return position;
};

/**
 * Creates a footer element for the ranking export
 * @returns A div element with footer text
 */
export const createRankingFooter = () => {
  const footer = document.createElement('div');
  footer.style.marginTop = '20px';
  footer.style.textAlign = 'center';
  footer.style.color = '#718096';
  footer.style.fontSize = '14px';
  footer.textContent = 'Gerado por APA Poker Gestão';
  
  return footer;
};
