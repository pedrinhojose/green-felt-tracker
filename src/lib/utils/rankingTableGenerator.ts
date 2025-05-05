
import { RankingEntry } from '../db/models';
import { 
  createPlayerAvatar, 
  createPositionMedal,
  createTableHeader
} from './rankingHtmlGenerator';

/**
 * Creates a table row for a player in the ranking
 * @param ranking The ranking entry for the player
 * @param index The index position in the ranking list
 * @param getInitials Function to get player initials from name
 * @param getMedalEmoji Function to get medal emoji for position
 * @returns A styled tr element with player ranking data
 */
export const createPlayerRow = (
  ranking: RankingEntry,
  index: number,
  getInitials: (name: string) => string,
  getMedalEmoji: (position: number) => string
) => {
  const row = document.createElement('tr');
  row.style.borderBottom = '1px solid #072818';
  row.style.height = '28px'; // Altura aumentada para melhor visualização
  
  // Coluna de posição
  const positionCell = document.createElement('td');
  positionCell.style.padding = '4px 6px';
  const medalSpan = createPositionMedal(index, getMedalEmoji);
  positionCell.appendChild(medalSpan);
  row.appendChild(positionCell);
  
  // Coluna do jogador
  const playerCell = document.createElement('td');
  playerCell.style.padding = '4px 6px';
  playerCell.style.maxWidth = '140px';
  playerCell.style.overflow = 'hidden';
  playerCell.style.whiteSpace = 'nowrap';
  playerCell.style.textOverflow = 'ellipsis';
  
  const playerDiv = document.createElement('div');
  playerDiv.style.display = 'flex';
  playerDiv.style.alignItems = 'center';
  playerDiv.style.gap = '4px';
  
  // Avatar
  const avatarDiv = createPlayerAvatar(ranking, getInitials);
  
  // Nome do jogador
  const nameDiv = document.createElement('div');
  nameDiv.textContent = ranking.playerName;
  nameDiv.style.fontWeight = '500';
  nameDiv.style.overflow = 'hidden';
  nameDiv.style.textOverflow = 'ellipsis';
  nameDiv.style.color = '#ffffff';
  
  playerDiv.appendChild(avatarDiv);
  playerDiv.appendChild(nameDiv);
  playerCell.appendChild(playerDiv);
  row.appendChild(playerCell);
  
  // Jogos
  const gamesCell = document.createElement('td');
  gamesCell.textContent = ranking.gamesPlayed.toString();
  gamesCell.style.textAlign = 'center';
  gamesCell.style.padding = '4px 6px';
  gamesCell.style.color = '#ffffff';
  row.appendChild(gamesCell);
  
  // Pontos
  const pointsCell = document.createElement('td');
  pointsCell.textContent = ranking.totalPoints.toString();
  pointsCell.style.textAlign = 'center';
  pointsCell.style.fontWeight = 'bold';
  pointsCell.style.padding = '4px 6px';
  pointsCell.style.color = '#D4AF37'; // Cor dourada
  row.appendChild(pointsCell);
  
  return row;
};

/**
 * Creates a complete ranking table with all players
 * @param sortedRankings Array of sorted ranking entries
 * @param getInitials Function to get player initials from name
 * @param getMedalEmoji Function to get medal emoji for position
 * @returns A styled table element with all player rankings
 */
export const createRankingTable = (
  sortedRankings: RankingEntry[],
  getInitials: (name: string) => string,
  getMedalEmoji: (position: number) => string
) => {
  const tableElement = document.createElement('table');
  tableElement.style.width = '100%';
  tableElement.style.borderCollapse = 'collapse';
  tableElement.style.tableLayout = 'fixed';
  tableElement.style.fontSize = '12px';
  
  // Usar o createTableHeader importado diretamente
  tableElement.appendChild(createTableHeader());
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  sortedRankings.forEach((ranking, index) => {
    const row = createPlayerRow(ranking, index, getInitials, getMedalEmoji);
    tbody.appendChild(row);
  });
  
  tableElement.appendChild(tbody);
  return tableElement;
};
