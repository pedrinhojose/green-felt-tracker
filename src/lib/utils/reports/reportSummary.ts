import { Game } from '../../db/models';
import { formatCurrency } from '../dateUtils';

/**
 * Creates the summary section with totals and winner information
 * @param game The game object  
 * @param players Array of all players
 * @returns A div element with the summary
 */
export const createReportSummary = (game: Game, players = []) => {
  const summary = document.createElement('div');
  summary.style.borderTop = '1px solid rgba(255,255,255,0.2)';
  summary.style.paddingTop = '12px';
  summary.style.paddingBottom = '20px'; // Padding extra na parte inferior
  
  // Winners section
  const winnersSection = document.createElement('div');
  winnersSection.style.marginBottom = '12px';
  
  // Find top 3 winners
  const top3Players = game.players
    .filter(p => p.position && p.position <= 3)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  if (top3Players.length > 0) {
    const winnersTitle = document.createElement('div');
    winnersTitle.textContent = 'VENCEDORES';
    winnersTitle.style.fontSize = '15px';
    winnersTitle.style.fontWeight = 'bold';
    winnersTitle.style.color = '#9b87f5';
    winnersTitle.style.marginBottom = '8px';
    winnersSection.appendChild(winnersTitle);
    
    // Create winners table
    const winnersTable = document.createElement('div');
    winnersTable.style.display = 'flex';
    winnersTable.style.flexDirection = 'column';
    winnersTable.style.gap = '6px';
    
    for (const player of top3Players) {
      const playerData = players.find(p => p.id === player.playerId);
      const playerName = playerData?.name || 'Desconhecido';
      const position = player.position || 0;
      const prize = player.prize || 0;
      
      // Create player row
      const playerRow = document.createElement('div');
      playerRow.style.display = 'grid';
      playerRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
      playerRow.style.gap = '2px';
      
      // Position and name
      const playerInfoContainer = document.createElement('div');
      playerInfoContainer.style.display = 'flex';
      playerInfoContainer.style.alignItems = 'center';
      
      const positionSpan = document.createElement('span');
      positionSpan.textContent = `${position}º`;
      positionSpan.style.fontWeight = 'bold';
      positionSpan.style.marginRight = '6px';
      
      if (position === 1) {
        positionSpan.style.color = '#FFD700';
      } else if (position === 2) {
        positionSpan.style.color = '#C0C0C0';
      } else if (position === 3) {
        positionSpan.style.color = '#CD7F32';
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = playerName;
      nameSpan.style.fontSize = '13px';
      
      playerInfoContainer.appendChild(positionSpan);
      playerInfoContainer.appendChild(nameSpan);
      
      // Prize
      const prizeSpan = document.createElement('span');
      prizeSpan.textContent = formatCurrency(prize);
      prizeSpan.style.fontWeight = 'bold';
      prizeSpan.style.fontSize = '13px';
      prizeSpan.style.textAlign = 'center';
      
      if (position === 1) {
        prizeSpan.style.color = '#FFD700';
      }
      
      playerRow.appendChild(playerInfoContainer);
      playerRow.appendChild(prizeSpan);
      
      winnersTable.appendChild(playerRow);
    }
    
    winnersSection.appendChild(winnersTable);
    summary.appendChild(winnersSection);
  }
  
  // Total Dinner
  if (game.dinnerCost && game.dinnerCost > 0) {
    const dinnerRow = document.createElement('div');
    dinnerRow.style.display = 'grid';
    dinnerRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
    dinnerRow.style.gap = '2px';
    dinnerRow.style.marginBottom = '8px';
    
    const dinnerLabel = document.createElement('div');
    dinnerLabel.textContent = 'Total Janta:';
    dinnerLabel.style.color = '#8E9196';
    dinnerLabel.style.fontSize = '13px';
    
    const dinnerValue = document.createElement('div');
    dinnerValue.textContent = formatCurrency(game.dinnerCost);
    dinnerValue.style.fontWeight = 'bold';
    dinnerValue.style.fontSize = '13px';
    dinnerValue.style.textAlign = 'center';
    
    dinnerRow.appendChild(dinnerLabel);
    dinnerRow.appendChild(dinnerValue);
    summary.appendChild(dinnerRow);
    
    // Individual Dinner Cost
    const dinnerParticipants = game.players.filter(p => p.joinedDinner).length;
    if (dinnerParticipants > 0) {
      const individualDinnerCost = game.dinnerCost / dinnerParticipants;
      
      const individualDinnerRow = document.createElement('div');
      individualDinnerRow.style.display = 'grid';
      individualDinnerRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
      individualDinnerRow.style.gap = '2px';
      individualDinnerRow.style.marginBottom = '8px';
      
      const individualDinnerLabel = document.createElement('div');
      individualDinnerLabel.textContent = 'Janta por Pessoa:';
      individualDinnerLabel.style.color = '#8E9196';
      individualDinnerLabel.style.fontSize = '13px';
      
      const individualDinnerValue = document.createElement('div');
      individualDinnerValue.textContent = formatCurrency(individualDinnerCost);
      individualDinnerValue.style.fontWeight = 'bold';
      individualDinnerValue.style.fontSize = '13px';
      individualDinnerValue.style.textAlign = 'center';
      
      individualDinnerRow.appendChild(individualDinnerLabel);
      individualDinnerRow.appendChild(individualDinnerValue);
      summary.appendChild(individualDinnerRow);
    }
  }
  
  // Total Prize
  const prizeRow = document.createElement('div');
  prizeRow.style.display = 'grid';
  prizeRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
  prizeRow.style.gap = '2px';
  prizeRow.style.marginBottom = '15px'; // Aumentando margem para dar mais espaço
  
  const prizeLabel = document.createElement('div');
  prizeLabel.textContent = 'Prêmio Total:';
  prizeLabel.style.color = '#8E9196';
  prizeLabel.style.fontSize = '13px';
  
  const prizeValue = document.createElement('div');
  prizeValue.textContent = formatCurrency(game.totalPrizePool);
  prizeValue.style.fontWeight = 'bold';
  prizeValue.style.color = '#9b87f5';
  prizeValue.style.fontSize = '17px';
  prizeValue.style.textAlign = 'center';
  
  prizeRow.appendChild(prizeLabel);
  prizeRow.appendChild(prizeValue);
  summary.appendChild(prizeRow);
  
  // Jackpot contribution (new)
  if (game.seasonId) {
    // Add "RETIRADO AO JACKPOT" row
    const contributionRow = document.createElement('div');
    contributionRow.style.display = 'grid';
    contributionRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
    contributionRow.style.gap = '2px';
    contributionRow.style.marginTop = '4px';
    contributionRow.style.paddingTop = '8px';
    contributionRow.style.borderTop = '1px dashed rgba(255,255,255,0.1)';
    contributionRow.style.marginBottom = '8px'; // Margem para separar do jackpot
    
    const contributionLabel = document.createElement('div');
    contributionLabel.textContent = 'Retirado ao Jackpot:';
    contributionLabel.style.color = '#8E9196';
    contributionLabel.style.fontSize = '13px';
    
    const contributionValue = document.createElement('div');
    contributionValue.setAttribute('data-jackpot-contribution-placeholder', 'true');
    contributionValue.textContent = 'Carregando...';
    contributionValue.style.fontWeight = 'bold';
    contributionValue.style.color = '#C0C0C0';
    contributionValue.style.fontSize = '13px';
    contributionValue.style.textAlign = 'center';
    
    contributionRow.appendChild(contributionLabel);
    contributionRow.appendChild(contributionValue);
    summary.appendChild(contributionRow);
    
    // Jackpot value
    const jackpotRow = document.createElement('div');
    jackpotRow.style.display = 'grid';
    jackpotRow.style.gridTemplateColumns = 'minmax(100px, 1fr) 70px';
    jackpotRow.style.gap = '2px';
    jackpotRow.style.marginTop = '4px';
    jackpotRow.style.marginBottom = '15px'; // Margem extra na parte inferior
    
    const jackpotLabel = document.createElement('div');
    jackpotLabel.textContent = 'Jackpot Acumulado:';
    jackpotLabel.style.color = '#8E9196';
    jackpotLabel.style.fontSize = '13px';
    
    const jackpotValue = document.createElement('div');
    jackpotValue.setAttribute('data-jackpot-placeholder', 'true');
    jackpotValue.textContent = 'Carregando...';
    jackpotValue.style.fontWeight = 'bold';
    jackpotValue.style.color = '#FFD700';
    jackpotValue.style.fontSize = '15px';
    jackpotValue.style.textAlign = 'center';
    
    jackpotRow.appendChild(jackpotLabel);
    jackpotRow.appendChild(jackpotValue);
    summary.appendChild(jackpotRow);
  }
  
  return summary;
};
