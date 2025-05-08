
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
 * @param getMedalEmoji Optional function to get medal emoji based on position
 * @returns A styled tr element with player ranking data
 */
export const createPlayerRow = (
  ranking: RankingEntry,
  index: number,
  getInitials: (name: string) => string,
  getMedalEmoji?: (position: number) => string
) => {
  const row = document.createElement('tr');
  row.style.borderBottom = '1px solid #2D3748';
  row.style.height = '48px'; // Altura aumentada para melhor visualização
  
  // Coluna de posição
  const positionCell = document.createElement('td');
  positionCell.style.padding = '8px 8px 8px 16px';
  positionCell.style.width = '50px';
  positionCell.style.textAlign = 'center';
  
  // Use getMedalEmoji if provided, otherwise use default position number
  if (getMedalEmoji && index < 3) {
    const medalSpan = document.createElement('span');
    medalSpan.textContent = getMedalEmoji(index);
    medalSpan.style.fontSize = '20px';
    positionCell.appendChild(medalSpan);
  } else {
    const positionElement = createPositionNumber(index);
    positionCell.appendChild(positionElement);
  }
  
  row.appendChild(positionCell);
  
  // Coluna do jogador com avatar
  const playerCell = document.createElement('td');
  playerCell.style.padding = '8px 4px';
  
  const playerDiv = document.createElement('div');
  playerDiv.style.display = 'flex';
  playerDiv.style.alignItems = 'center';
  playerDiv.style.gap = '8px';
  
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
  
  // Pontos (em amarelo conforme solicitado)
  const pointsCell = document.createElement('td');
  pointsCell.textContent = ranking.totalPoints.toString();
  pointsCell.style.textAlign = 'center';
  pointsCell.style.fontWeight = 'bold';
  pointsCell.style.padding = '8px 4px';
  pointsCell.style.fontSize = '18px';
  pointsCell.style.color = '#D4AF37'; // Cor dourada/amarela para pontos
  pointsCell.style.width = '80px';
  row.appendChild(pointsCell);
  
  // Partidas (em branco conforme solicitado)
  const gamesCell = document.createElement('td');
  gamesCell.textContent = ranking.gamesPlayed.toString();
  gamesCell.style.textAlign = 'center';
  gamesCell.style.padding = '8px 4px';
  gamesCell.style.fontSize = '18px';
  gamesCell.style.color = '#ffffff'; // Cor branca para jogos
  gamesCell.style.width = '80px';
  row.appendChild(gamesCell);
  
  return row;
};

/**
 * Creates a complete ranking table with all players
 * @param sortedRankings Array of sorted ranking entries
 * @param getInitials Function to get player initials from name
 * @param getMedalEmoji Optional function to get medal emoji based on position
 * @returns A styled table element with all player rankings
 */
export const createRankingTable = (
  sortedRankings: RankingEntry[],
  getInitials: (name: string) => string,
  getMedalEmoji?: (position: number) => string
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
    const row = createPlayerRow(ranking, index, getInitials, getMedalEmoji);
    tbody.appendChild(row);
  });
  
  tableElement.appendChild(tbody);
  return tableElement;
};

