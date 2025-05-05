
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
  // Ajustando o grid para dar mais espaço à coluna do nome e removendo a coluna de valor do add-on
  tableHeader.style.gridTemplateColumns = '20px 1fr repeat(4, auto)';
  tableHeader.style.gap = '8px';
  tableHeader.style.borderBottom = '1px solid rgba(255,255,255,0.15)';
  tableHeader.style.padding = '6px 0';
  tableHeader.style.fontSize = '12px';
  tableHeader.style.color = '#8E9196';
  
  // Header columns - removendo a coluna de valor do add-on
  const headers = ['#', 'Jogador', 'Rebuys', '+Ons', 'Janta', 'Saldo'];
  headers.forEach((header, index) => {
    const headerCell = document.createElement('div');
    headerCell.textContent = header;
    headerCell.style.textAlign = index === 1 ? 'left' : 'center';
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
    // Ajustando o grid para dar mais espaço à coluna do nome e removendo a coluna de valor do add-on
    row.style.gridTemplateColumns = '20px 1fr repeat(4, auto)';
    row.style.gap = '8px';
    row.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    row.style.padding = '10px 0';
    row.style.fontSize = '14px';
    
    // Position
    const posCell = document.createElement('div');
    posCell.textContent = gamePlayer.position ? gamePlayer.position.toString() : '-';
    posCell.style.textAlign = 'center';
    posCell.style.fontWeight = 'bold';
    
    // Player name
    const nameCell = document.createElement('div');
    nameCell.textContent = player.name;
    nameCell.style.fontWeight = 'bold';
    // Remover o texto em ellipsis para evitar cortar nomes longos
    nameCell.style.overflow = 'visible';
    // nameCell.style.textOverflow = 'ellipsis';
    // nameCell.style.whiteSpace = 'nowrap';
    
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
    
    // Removendo a coluna de valor da janta
    
    // Balance
    const balanceCell = document.createElement('div');
    balanceCell.textContent = formatCurrency(gamePlayer.balance);
    // Set color based on balance (positive = green, negative = red)
    balanceCell.style.color = gamePlayer.balance >= 0 ? '#F2FCE2' : '#ea384c';
    balanceCell.style.fontWeight = 'bold';
    balanceCell.style.textAlign = 'center';
    balanceCell.style.paddingLeft = '8px';
    
    row.appendChild(posCell);
    row.appendChild(nameCell);
    row.appendChild(rebuysCell);
    row.appendChild(addonsCell);
    row.appendChild(dinnerCell);
    row.appendChild(balanceCell);
    
    table.appendChild(row);
  });
  
  return table;
};
