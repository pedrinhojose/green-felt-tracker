
import { RankingEntry } from '../db/models';
import { 
  createPlayerAvatar, 
  createPositionNumber,
  createTableHeader
} from './rankingHtmlGenerator';

/**
 * Creates a table row for a player in the ranking
 * @param ranking The ranking entry for the player
 * @param index The index position in the ranking list
 * @param getInitials Function to get player initials from name
 * @returns A styled tr element with player ranking data
 */
export const createPlayerRow = (
  ranking: RankingEntry,
  index: number,
  getInitials: (name: string) => string
) => {
  const row = document.createElement('tr');
  row.style.borderBottom = '1px solid #2D3748';
  row.style.height = '48px'; // Altura aumentada para melhor visualização
  
  // Coluna de posição
  const positionCell = document.createElement('td');
  positionCell.style.padding = '8px 16px';
  positionCell.style.textAlign = 'center';
  const positionElement = createPositionNumber(index);
  positionCell.appendChild(positionElement);
  row.appendChild(positionCell);
  
  // Coluna do jogador com avatar
  const playerCell = document.createElement('td');
  playerCell.style.padding = '8px 16px';
  
  const playerDiv = document.createElement('div');
  playerDiv.style.display = 'flex';
  playerDiv.style.alignItems = 'center';
  playerDiv.style.gap = '12px';
  
  // Avatar
  const avatarDiv = createPlayerAvatar(ranking, getInitials);
  
  // Nome do jogador
  const nameDiv = document.createElement('div');
  nameDiv.textContent = ranking.playerName;
  nameDiv.style.fontWeight = '500';
  nameDiv.style.fontSize = '16px';
  nameDiv.style.color = '#ffffff';
  nameDiv.style.textTransform = 'uppercase';
  
  playerDiv.appendChild(avatarDiv);
  playerDiv.appendChild(nameDiv);
  playerCell.appendChild(playerDiv);
  row.appendChild(playerCell);
  
  // Pontos (colocado antes das partidas para seguir a ordem da imagem)
  const pointsCell = document.createElement('td');
  pointsCell.textContent = ranking.totalPoints.toString();
  pointsCell.style.textAlign = 'center';
  pointsCell.style.fontWeight = 'bold';
  pointsCell.style.padding = '8px 16px';
  pointsCell.style.fontSize = '18px';
  pointsCell.style.color = '#D4AF37'; // Cor dourada
  row.appendChild(pointsCell);
  
  // Partidas
  const gamesCell = document.createElement('td');
  gamesCell.textContent = ranking.gamesPlayed.toString();
  gamesCell.style.textAlign = 'center';
  gamesCell.style.padding = '8px 16px';
  gamesCell.style.fontSize = '18px';
  gamesCell.style.color = '#ffffff';
  row.appendChild(gamesCell);
  
  return row;
};

/**
 * Creates a complete ranking table with all players
 * @param sortedRankings Array of sorted ranking entries
 * @param getInitials Function to get player initials from name
 * @returns A styled table element with all player rankings
 */
export const createRankingTable = (
  sortedRankings: RankingEntry[],
  getInitials: (name: string) => string
) => {
  const tableElement = document.createElement('table');
  tableElement.style.width = '100%';
  tableElement.style.borderCollapse = 'collapse';
  tableElement.style.tableLayout = 'fixed';
  tableElement.style.fontSize = '14px';
  
  // Usar o createTableHeader importado diretamente
  tableElement.appendChild(createTableHeader());
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  sortedRankings.forEach((ranking, index) => {
    const row = createPlayerRow(ranking, index, getInitials);
    tbody.appendChild(row);
  });
  
  tableElement.appendChild(tbody);
  return tableElement;
};
