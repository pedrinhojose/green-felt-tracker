
import { Game, Player } from '../../db/models';
import { formatCurrency } from '../dateUtils';

/**
 * Creates the table showing players and their results
 * @param game The game object
 * @param players Array of all players
 * @returns A div element containing the players table
 */
export const createPlayersTable = (game: Game, players: Player[]) => {
  const table = document.createElement('div');
  table.style.marginBottom = '16px';
  
  // Table header
  const tableHeader = document.createElement('div');
  tableHeader.style.display = 'grid';
  // Layout mais compacto conforme a imagem de referência
  tableHeader.style.gridTemplateColumns = '18px 30px minmax(70px, 0.7fr) 42px 42px 42px 80px';
  tableHeader.style.gap = '2px';
  tableHeader.style.borderBottom = '1px solid rgba(255,255,255,0.15)';
  tableHeader.style.padding = '5px 0';
  tableHeader.style.fontSize = '11px';
  tableHeader.style.color = '#8E9196';
  
  // Header columns
  const headers = ['#', '', 'Jogador', 'Rebuys', '+Ons', 'Janta', 'Saldo'];
  headers.forEach((header, index) => {
    const headerCell = document.createElement('div');
    headerCell.textContent = header;
    // Alinhamento consistente para todas as colunas
    if (index === 2) {
      headerCell.style.textAlign = 'left';
      headerCell.style.paddingLeft = '2px';
    } else {
      headerCell.style.textAlign = 'center';
    }
    tableHeader.appendChild(headerCell);
  });
  
  table.appendChild(tableHeader);
  
  // Sort players by position
  const sortedPlayers = [...game.players]
    .sort((a, b) => {
      // Players without a position go to the end
      if (a.position === null) return 1;
      if (b.position === null) return -1;
      return a.position - b.position;
    });

  // Add row for each player
  const playerMap = new Map(players.map(player => [player.id, player]));
  
  // Calcular custo da janta por jogador
  const dinnerParticipants = sortedPlayers.filter(p => p.joinedDinner).length;
  const dinnerSharePerPlayer = game.dinnerCost && dinnerParticipants > 0 ? 
    game.dinnerCost / dinnerParticipants : 0;
  
  sortedPlayers.forEach(gamePlayer => {
    const player = playerMap.get(gamePlayer.playerId);
    if (!player) return;
    
    // Player row
    const row = document.createElement('div');
    row.style.display = 'grid';
    // Usando o mesmo template de grid do cabeçalho para manter consistência
    row.style.gridTemplateColumns = '18px 30px minmax(70px, 0.7fr) 42px 42px 42px 80px';
    row.style.gap = '2px';
    row.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    row.style.padding = '8px 0';
    row.style.fontSize = '12px';
    
    // Position
    const posCell = document.createElement('div');
    posCell.textContent = gamePlayer.position ? gamePlayer.position.toString() : '-';
    posCell.style.textAlign = 'center';
    posCell.style.fontWeight = 'bold';
    
    // Player photo
    const photoCell = document.createElement('div');
    photoCell.style.display = 'flex';
    photoCell.style.justifyContent = 'center';
    photoCell.style.alignItems = 'center';
    
    const photoImg = document.createElement('div');
    photoImg.style.width = '24px';
    photoImg.style.height = '24px';
    photoImg.style.borderRadius = '50%';
    photoImg.style.overflow = 'hidden';
    photoImg.style.backgroundColor = '#2A2A2A';
    
    if (player.photoUrl) {
      const img = document.createElement('img');
      img.src = player.photoUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      photoImg.appendChild(img);
    } else {
      // Placeholder for players without photo
      photoImg.style.display = 'flex';
      photoImg.style.justifyContent = 'center';
      photoImg.style.alignItems = 'center';
      photoImg.style.color = '#FFFFFF';
      photoImg.style.backgroundColor = '#8E9196';
      photoImg.textContent = player.name.charAt(0).toUpperCase();
      photoImg.style.fontSize = '12px';
      photoImg.style.fontWeight = 'bold';
    }
    
    photoCell.appendChild(photoImg);
    
    // Player name
    const nameCell = document.createElement('div');
    nameCell.textContent = player.name;
    nameCell.style.fontWeight = 'bold';
    nameCell.style.overflow = 'hidden';
    nameCell.style.textOverflow = 'ellipsis';
    nameCell.style.whiteSpace = 'nowrap';
    nameCell.style.display = 'flex';
    nameCell.style.alignItems = 'center';
    nameCell.style.paddingLeft = '0'; // Reduzir espaço à esquerda
    
    // Rebuys
    const rebuysCell = document.createElement('div');
    rebuysCell.textContent = gamePlayer.rebuys.toString();
    rebuysCell.style.textAlign = 'center';
    
    // Add-ons
    const addonsCell = document.createElement('div');
    addonsCell.textContent = gamePlayer.addons.toString();
    addonsCell.style.textAlign = 'center';
    
    // Dinner
    const dinnerCell = document.createElement('div');
    dinnerCell.textContent = gamePlayer.joinedDinner ? 'Sim' : 'Não';
    dinnerCell.style.textAlign = 'center';
    
    // Balance
    const balanceCell = document.createElement('div');
    balanceCell.textContent = formatCurrency(gamePlayer.balance);
    // Set color based on balance (positive = green, negative = red)
    balanceCell.style.color = gamePlayer.balance >= 0 ? '#F2FCE2' : '#ea384c';
    balanceCell.style.fontWeight = 'bold';
    balanceCell.style.textAlign = 'center';
    
    row.appendChild(posCell);
    row.appendChild(photoCell);
    row.appendChild(nameCell);
    row.appendChild(rebuysCell);
    row.appendChild(addonsCell);
    row.appendChild(dinnerCell);
    row.appendChild(balanceCell);
    
    table.appendChild(row);
  });
  
  return table;
};
