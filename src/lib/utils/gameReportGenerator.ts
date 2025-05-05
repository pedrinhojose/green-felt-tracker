
import { Game, Player } from '../db/models';
import { formatDate, formatCurrency } from './dateUtils';

/**
 * Cria o container principal do relatório de jogo
 * @returns Um elemento div estilizado para o relatório
 */
export const createReportContainer = () => {
  const container = document.createElement('div');
  container.style.width = '360px';
  container.style.padding = '16px';
  container.style.backgroundColor = '#1A1F2C';
  container.style.borderRadius = '12px';
  container.style.color = '#FFFFFF';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  return container;
};

/**
 * Cria o cabeçalho do relatório com título e data
 * @param game O objeto do jogo
 * @param seasonName Nome da temporada
 * @returns Um elemento div com o cabeçalho do relatório
 */
export const createReportHeader = (game: Game, seasonName: string) => {
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  header.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
  header.style.paddingBottom = '12px';
  
  // Título
  const title = document.createElement('h2');
  title.textContent = 'Resultados do Poker';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 8px 0';
  title.style.color = '#9b87f5';
  
  // Subtítulo com número do jogo, temporada e data
  const subtitle = document.createElement('div');
  subtitle.textContent = `Partida #${game.number.toString().padStart(3, '0')} - ${seasonName}`;
  subtitle.style.fontSize = '14px';
  subtitle.style.color = '#8E9196';
  
  // Data
  const dateText = document.createElement('div');
  dateText.textContent = formatDate(game.date);
  dateText.style.fontSize = '14px';
  dateText.style.color = '#8E9196';
  dateText.style.marginTop = '4px';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  header.appendChild(dateText);
  return header;
};

/**
 * Cria a tabela de jogadores com seus resultados
 * @param game O objeto do jogo
 * @param players Array com todos os jogadores
 * @returns Um elemento div com a tabela de resultados
 */
export const createPlayersTable = (game: Game, players: Player[]) => {
  const table = document.createElement('div');
  table.style.marginBottom = '16px';
  
  // Cabeçalho da tabela
  const tableHeader = document.createElement('div');
  tableHeader.style.display = 'grid';
  tableHeader.style.gridTemplateColumns = '20px 1fr repeat(4, auto)';
  tableHeader.style.gap = '8px';
  tableHeader.style.borderBottom = '1px solid rgba(255,255,255,0.15)';
  tableHeader.style.padding = '6px 0';
  tableHeader.style.fontSize = '12px';
  tableHeader.style.color = '#8E9196';
  
  // Colunas do cabeçalho
  const headers = ['#', 'Jogador', 'Rebuys', '+Ons', 'Janta', 'Saldo'];
  headers.forEach((header, index) => {
    const headerCell = document.createElement('div');
    headerCell.textContent = header;
    headerCell.style.textAlign = index === 1 ? 'left' : 'center';
    tableHeader.appendChild(headerCell);
  });
  
  table.appendChild(tableHeader);
  
  // Ordenar jogadores por posição
  const sortedPlayers = [...game.players]
    .sort((a, b) => {
      // Jogadores sem posição vão para o final
      if (a.position === null) return 1;
      if (b.position === null) return -1;
      return a.position - b.position;
    });

  // Adicionar linhas para cada jogador
  const playerMap = new Map(players.map(player => [player.id, player]));
  
  sortedPlayers.forEach(gamePlayer => {
    const player = playerMap.get(gamePlayer.playerId);
    if (!player) return;
    
    // Calcular janta por jogador
    const dinnerShare = gamePlayer.joinedDinner && game.dinnerCost ? 
      game.dinnerCost / game.players.filter(p => p.joinedDinner).length : 0;
    
    // Linha do jogador
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '20px 1fr repeat(4, auto)';
    row.style.gap = '8px';
    row.style.borderBottom = '1px solid rgba(255,255,255,0.07)';
    row.style.padding = '10px 0';
    row.style.fontSize = '14px';
    
    // Posição
    const posCell = document.createElement('div');
    posCell.textContent = gamePlayer.position ? gamePlayer.position.toString() : '-';
    posCell.style.textAlign = 'center';
    posCell.style.fontWeight = 'bold';
    
    // Nome do jogador
    const nameCell = document.createElement('div');
    nameCell.textContent = player.name;
    nameCell.style.fontWeight = 'bold';
    nameCell.style.overflow = 'hidden';
    nameCell.style.textOverflow = 'ellipsis';
    nameCell.style.whiteSpace = 'nowrap';
    
    // Rebuys
    const rebuysCell = document.createElement('div');
    rebuysCell.textContent = gamePlayer.rebuys.toString();
    rebuysCell.style.textAlign = 'center';
    
    // Add-ons
    const addonsCell = document.createElement('div');
    addonsCell.textContent = gamePlayer.addons.toString();
    addonsCell.style.textAlign = 'center';
    
    // Janta
    const dinnerCell = document.createElement('div');
    dinnerCell.textContent = gamePlayer.joinedDinner ? formatCurrency(dinnerShare) : '-';
    dinnerCell.style.textAlign = 'center';
    
    // Saldo
    const balanceCell = document.createElement('div');
    balanceCell.textContent = formatCurrency(gamePlayer.balance);
    // Definir cor dependendo do saldo (positivo = verde, negativo = vermelho)
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

/**
 * Cria o resumo do jogo com totais
 * @param game O objeto do jogo
 * @returns Um elemento div com o resumo
 */
export const createReportSummary = (game: Game) => {
  const summary = document.createElement('div');
  summary.style.borderTop = '1px solid rgba(255,255,255,0.2)';
  summary.style.paddingTop = '12px';
  
  // Total Janta
  if (game.dinnerCost && game.dinnerCost > 0) {
    const dinnerRow = document.createElement('div');
    dinnerRow.style.display = 'flex';
    dinnerRow.style.justifyContent = 'space-between';
    dinnerRow.style.marginBottom = '8px';
    
    const dinnerLabel = document.createElement('div');
    dinnerLabel.textContent = 'Total Janta:';
    dinnerLabel.style.color = '#8E9196';
    
    const dinnerValue = document.createElement('div');
    dinnerValue.textContent = formatCurrency(game.dinnerCost);
    dinnerValue.style.fontWeight = 'bold';
    
    dinnerRow.appendChild(dinnerLabel);
    dinnerRow.appendChild(dinnerValue);
    summary.appendChild(dinnerRow);
  }
  
  // Total Prêmio
  const prizeRow = document.createElement('div');
  prizeRow.style.display = 'flex';
  prizeRow.style.justifyContent = 'space-between';
  
  const prizeLabel = document.createElement('div');
  prizeLabel.textContent = 'Prêmio Total:';
  prizeLabel.style.color = '#8E9196';
  
  const prizeValue = document.createElement('div');
  prizeValue.textContent = formatCurrency(game.totalPrizePool);
  prizeValue.style.fontWeight = 'bold';
  prizeValue.style.color = '#9b87f5';
  prizeValue.style.fontSize = '16px';
  
  prizeRow.appendChild(prizeLabel);
  prizeRow.appendChild(prizeValue);
  summary.appendChild(prizeRow);
  
  return summary;
};

/**
 * Gera a assinatura/rodapé do relatório
 * @returns Um elemento div com a assinatura
 */
export const createReportFooter = () => {
  const footer = document.createElement('div');
  footer.style.marginTop = '16px';
  footer.style.borderTop = '1px solid rgba(255,255,255,0.15)';
  footer.style.paddingTop = '12px';
  footer.style.fontSize = '12px';
  footer.style.color = '#8E9196';
  footer.style.textAlign = 'center';
  
  footer.textContent = 'Gerado pelo APA Poker Club';
  
  return footer;
};

/**
 * Gera o relatório de jogo completo
 * @param game O objeto do jogo
 * @param players Array com todos os jogadores
 * @param seasonName Nome da temporada
 * @returns Um elemento HTML completo para o relatório
 */
export const createGameReport = (game: Game, players: Player[], seasonName: string) => {
  const container = createReportContainer();
  
  // Adicionar cabeçalho
  container.appendChild(createReportHeader(game, seasonName));
  
  // Adicionar tabela de jogadores
  container.appendChild(createPlayersTable(game, players));
  
  // Adicionar resumo
  container.appendChild(createReportSummary(game));
  
  // Adicionar rodapé
  container.appendChild(createReportFooter());
  
  return container;
};
