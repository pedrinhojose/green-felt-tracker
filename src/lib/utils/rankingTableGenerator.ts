
import { RankingEntry } from "../db/models";

/**
 * Creates a table for displaying ranking data
 * @param sortedRankings Sorted array of ranking entries
 * @param getInitials Function to get initials from player name
 * @param getMedalEmoji Optional function to get medal emoji for positions
 * @returns HTML table element with ranking data
 */
export const createRankingTable = (
  sortedRankings: RankingEntry[], 
  getInitials: (name: string) => string,
  getMedalEmoji?: (position: number) => string
) => {
  // Create table element
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  
  // Create table header
  const thead = createTableHeader();
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Populate table rows with ranking data
  sortedRankings.forEach((ranking, index) => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #2D3748';
    
    // Position column
    const positionCell = document.createElement('td');
    positionCell.style.padding = '12px 8px 12px 16px';
    positionCell.style.verticalAlign = 'middle';
    
    const positionWrapper = document.createElement('div');
    positionWrapper.style.width = '30px';
    positionWrapper.style.height = '30px';
    positionWrapper.style.borderRadius = '50%';
    positionWrapper.style.backgroundColor = '#1e3a8a';
    positionWrapper.style.color = 'white';
    positionWrapper.style.display = 'flex';
    positionWrapper.style.alignItems = 'center';
    positionWrapper.style.justifyContent = 'center';
    positionWrapper.style.fontSize = '14px';
    positionWrapper.style.fontWeight = 'bold';
    
    // Add medal emoji if function provided, otherwise use position number
    positionWrapper.textContent = getMedalEmoji ? getMedalEmoji(index) : (index + 1).toString();
    
    positionCell.appendChild(positionWrapper);
    row.appendChild(positionCell);
    
    // Player name and avatar column
    const playerCell = document.createElement('td');
    playerCell.style.padding = '8px';
    playerCell.style.verticalAlign = 'middle';
    
    const playerInfo = document.createElement('div');
    playerInfo.style.display = 'flex';
    playerInfo.style.alignItems = 'center';
    playerInfo.style.gap = '8px';
    
    const avatar = document.createElement('div');
    avatar.style.width = '32px';
    avatar.style.height = '32px';
    avatar.style.borderRadius = '50%';
    avatar.style.backgroundColor = '#1e3a8a';
    avatar.style.color = 'white';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontSize = '14px';
    avatar.style.fontWeight = 'bold';
    
    // If player has photo, use it, otherwise show initials
    if (ranking.photoUrl) {
      const img = document.createElement('img');
      img.src = ranking.photoUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      avatar.appendChild(img);
    } else {
      avatar.textContent = getInitials(ranking.playerName);
    }
    
    const name = document.createElement('div');
    name.textContent = ranking.playerName;
    name.style.fontWeight = '500';
    name.style.color = '#E5E7EB';
    
    playerInfo.appendChild(avatar);
    playerInfo.appendChild(name);
    playerCell.appendChild(playerInfo);
    row.appendChild(playerCell);
    
    // Games played column
    const gamesCell = document.createElement('td');
    gamesCell.style.padding = '8px';
    gamesCell.style.textAlign = 'center';
    gamesCell.style.color = '#E5E7EB';
    gamesCell.textContent = ranking.gamesPlayed.toString();
    row.appendChild(gamesCell);
    
    // Points column
    const pointsCell = document.createElement('td');
    pointsCell.style.padding = '8px';
    pointsCell.style.textAlign = 'center';
    pointsCell.style.fontWeight = 'bold';
    pointsCell.style.color = '#D4AF37'; // Gold color for points
    pointsCell.textContent = ranking.totalPoints.toString();
    row.appendChild(pointsCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  
  return table;
};

/**
 * Creates the table header for the ranking
 * @returns A thead element with styled headers
 */
const createTableHeader = () => {
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.borderBottom = '1px solid #2D3748';
  
  // Define headers and their styling properties
  const headers = ['#', 'Jogador', 'Jogos', 'Pontos'];
  const columnWidths = ['50px', 'auto', '80px', '80px'];
  const textAligns = ['center', 'left', 'center', 'center'];
  
  headers.forEach((headerText, index) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = index === 0 ? '8px 8px 8px 16px' : '8px 4px';
    th.style.textAlign = textAligns[index];
    th.style.fontSize = '16px';
    th.style.fontWeight = 'bold';
    th.style.color = '#ffffff';
    th.style.width = columnWidths[index];
    
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  return thead;
};
