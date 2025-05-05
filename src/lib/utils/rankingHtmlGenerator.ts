
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
  (header as HTMLElement).style.display = 'flex';
  (header as HTMLElement).style.justifyContent = 'space-between';
  (header as HTMLElement).style.alignItems = 'center';
  (header as HTMLElement).style.marginBottom = '10px';
  (header as HTMLElement).style.padding = '6px 10px';
  (header as HTMLElement).style.borderBottom = '2px solid #072818';
  
  const title = document.createElement('h2');
  (title as HTMLElement).textContent = 'Ranking do Poker';
  (title as HTMLElement).style.fontSize = '18px';
  (title as HTMLElement).style.fontWeight = 'bold';
  (title as HTMLElement).style.color = '#ffffff';
  
  const subtitle = document.createElement('p');
  (subtitle as HTMLElement).textContent = activeSeason ? activeSeason.name : 'Temporada Ativa';
  (subtitle as HTMLElement).style.color = '#D4AF37';
  (subtitle as HTMLElement).style.fontSize = '12px';
  
  const titleContainer = document.createElement('div');
  titleContainer.appendChild(title);
  titleContainer.appendChild(subtitle);
  
  header.appendChild(titleContainer);
  
  // Adicionar a data da exportação
  const dateContainer = document.createElement('div');
  (dateContainer as HTMLElement).textContent = new Date().toLocaleDateString('pt-BR');
  (dateContainer as HTMLElement).style.color = '#ffffff';
  (dateContainer as HTMLElement).style.fontSize = '11px';
  
  header.appendChild(dateContainer);
  
  return header;
};

/**
 * Creates a styled container for the ranking export
 * @returns A div element styled for the ranking export
 */
export const createRankingContainer = () => {
  const exportDiv = document.createElement('div');
  exportDiv.id = 'ranking-export';
  (exportDiv as HTMLElement).style.padding = '15px';
  (exportDiv as HTMLElement).style.backgroundColor = '#0A3B23';
  (exportDiv as HTMLElement).style.borderRadius = '12px';
  (exportDiv as HTMLElement).style.width = '100%';
  (exportDiv as HTMLElement).style.maxWidth = '400px';  // Largura ideal para visualização
  (exportDiv as HTMLElement).style.margin = '0 auto';
  (exportDiv as HTMLElement).style.overflow = 'visible';
  
  return exportDiv;
};

/**
 * Creates the table header for the ranking export
 * @returns A thead element with styled headers
 */
export const createTableHeader = () => {
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.borderBottom = '1px solid #072818';
  
  const headers = ['#', 'Jogador', 'Jogos', 'Pontos'];
  const headerWidths = ['36px', '140px', '40px', '50px'];
  
  headers.forEach((headerText, index) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '4px 6px';
    th.style.textAlign = index === 0 || index === 1 ? 'left' : 'center';
    th.style.width = headerWidths[index];
    th.style.color = '#ffffff';
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
  avatarDiv.style.width = '20px';
  avatarDiv.style.height = '20px';
  avatarDiv.style.borderRadius = '50%';
  avatarDiv.style.backgroundColor = '#1e3a8a';
  avatarDiv.style.color = 'white';
  avatarDiv.style.display = 'flex';
  avatarDiv.style.alignItems = 'center';
  avatarDiv.style.justifyContent = 'center';
  avatarDiv.style.fontSize = '9px';
  avatarDiv.style.fontWeight = 'bold';
  avatarDiv.style.flexShrink = '0';
  
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
 * Creates a medal position element for ranking display
 * @param index The player's position in the ranking (zero-based)
 * @param getMedalEmoji Function to get medal emoji for position
 * @returns A styled span element with position indicator
 */
export const createPositionMedal = (index: number, getMedalEmoji: (position: number) => string) => {
  const medalSpan = document.createElement('span');
  medalSpan.textContent = getMedalEmoji(index);
  medalSpan.style.display = 'inline-flex';
  medalSpan.style.alignItems = 'center';
  medalSpan.style.justifyContent = 'center';
  medalSpan.style.width = '24px';
  medalSpan.style.height = '24px';
  medalSpan.style.backgroundColor = '#072818';
  medalSpan.style.borderRadius = '50%';
  medalSpan.style.textAlign = 'center';
  
  return medalSpan;
};
