
import { RankingEntry } from '../db/models';

/**
 * Cria a tabela do ranking otimizada para exportação - SEM CORTES LATERAIS
 */
export const createRankingTable = (
  sortedRankings: RankingEntry[],
  getInitials: (name: string) => string,
  getMedalEmoji?: (position: number) => string
): HTMLTableElement => {
  const table = document.createElement('table');
  
  // Estilo da tabela otimizado para não cortar
  table.style.cssText = `
    width: 100%;
    min-width: max-content;
    border-collapse: collapse;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    table-layout: auto;
  `;
  
  // Criar cabeçalho
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.background = 'linear-gradient(90deg, #1f2937, #374151)';
  
  const headers = [
    { text: 'Pos.', width: '60px' },
    { text: 'Jogador', width: '200px' },
    { text: 'Jogos', width: '80px' },
    { text: 'Pontos', width: '100px' }
  ];
  
  headers.forEach(header => {
    const th = document.createElement('th');
    th.style.cssText = `
      padding: 12px 16px;
      text-align: ${header.text === 'Jogador' ? 'left' : 'center'};
      font-weight: bold;
      color: #f9fafb;
      font-size: 14px;
      border-bottom: 2px solid rgba(245, 158, 11, 0.3);
      min-width: ${header.width};
      white-space: nowrap;
    `;
    th.textContent = header.text;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Criar corpo da tabela
  const tbody = document.createElement('tbody');
  
  sortedRankings.forEach((ranking, index) => {
    const row = document.createElement('tr');
    const position = index + 1;
    
    // Estilo alternado das linhas
    const isEven = index % 2 === 0;
    row.style.cssText = `
      background: ${isEven ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)'};
      transition: background-color 0.2s;
    `;
    
    // Hover effect
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(245, 158, 11, 0.1)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.background = isEven ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)';
    });
    
    // Coluna posição
    const posCell = document.createElement('td');
    posCell.style.cssText = `
      padding: 12px 16px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      color: ${position <= 3 ? '#f59e0b' : '#d1d5db'};
      white-space: nowrap;
    `;
    
    // Usar emoji se disponível, senão número
    const positionDisplay = getMedalEmoji ? getMedalEmoji(index) : position.toString();
    posCell.textContent = positionDisplay;
    row.appendChild(posCell);
    
    // Coluna jogador
    const playerCell = document.createElement('td');
    playerCell.style.cssText = `
      padding: 12px 16px;
      font-weight: 500;
      color: #f9fafb;
      font-size: 14px;
      min-width: 200px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    
    // Container para foto e nome
    const playerContainer = document.createElement('div');
    playerContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    // Avatar do jogador
    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${position <= 3 ? 'linear-gradient(45deg, #f59e0b, #d97706)' : 'linear-gradient(45deg, #374151, #4b5563)'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      color: white;
      flex-shrink: 0;
      border: 2px solid ${position <= 3 ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)'};
    `;
    
    // Se tem foto, usar como background
    if (ranking.photoUrl) {
      avatar.style.backgroundImage = `url(${ranking.photoUrl})`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    } else {
      avatar.textContent = getInitials(ranking.playerName);
    }
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = ranking.playerName;
    nameSpan.style.flexGrow = '1';
    
    playerContainer.appendChild(avatar);
    playerContainer.appendChild(nameSpan);
    playerCell.appendChild(playerContainer);
    row.appendChild(playerCell);
    
    // Coluna jogos
    const gamesCell = document.createElement('td');
    gamesCell.style.cssText = `
      padding: 12px 16px;
      text-align: center;
      color: #d1d5db;
      font-size: 14px;
      white-space: nowrap;
    `;
    gamesCell.textContent = ranking.gamesPlayed.toString();
    row.appendChild(gamesCell);
    
    // Coluna pontos
    const pointsCell = document.createElement('td');
    pointsCell.style.cssText = `
      padding: 12px 16px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      color: #f59e0b;
      white-space: nowrap;
    `;
    pointsCell.textContent = ranking.totalPoints.toString();
    row.appendChild(pointsCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  
  return table;
};
