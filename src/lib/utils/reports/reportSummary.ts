
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
    winnersTitle.style.fontSize = '14px';
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
      playerRow.style.display = 'flex';
      playerRow.style.justifyContent = 'space-between';
      playerRow.style.alignItems = 'center';
      
      // Position and name
      const playerInfoContainer = document.createElement('div');
      playerInfoContainer.style.display = 'flex';
      playerInfoContainer.style.alignItems = 'center';
      
      const positionSpan = document.createElement('span');
      positionSpan.textContent = `${position}º`;
      positionSpan.style.fontWeight = 'bold';
      positionSpan.style.marginRight = '6px';
      
      if (position === 1) {
        positionSpan.style.color = '#FFD700'; // Gold
      } else if (position === 2) {
        positionSpan.style.color = '#C0C0C0'; // Silver
      } else if (position === 3) {
        positionSpan.style.color = '#CD7F32'; // Bronze
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = playerName;
      
      playerInfoContainer.appendChild(positionSpan);
      playerInfoContainer.appendChild(nameSpan);
      
      // Prize
      const prizeSpan = document.createElement('span');
      prizeSpan.textContent = formatCurrency(prize);
      prizeSpan.style.fontWeight = 'bold';
      
      if (position === 1) {
        prizeSpan.style.color = '#FFD700'; // Gold
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
  
  // Total Prize
  const prizeRow = document.createElement('div');
  prizeRow.style.display = 'flex';
  prizeRow.style.justifyContent = 'space-between';
  prizeRow.style.marginBottom = '12px'; // Add margin to separate from jackpot
  
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
  
  // Jackpot contribution (new)
  if (game.seasonId) {
    // Add "RETIRADO AO JACKPOT" row
    const contributionRow = document.createElement('div');
    contributionRow.style.display = 'flex';
    contributionRow.style.justifyContent = 'space-between';
    contributionRow.style.marginTop = '4px';
    contributionRow.style.paddingTop = '8px';
    contributionRow.style.borderTop = '1px dashed rgba(255,255,255,0.1)';
    
    const contributionLabel = document.createElement('div');
    contributionLabel.textContent = 'Retirado ao Jackpot:';
    contributionLabel.style.color = '#8E9196';
    
    const contributionValue = document.createElement('div');
    // Use a data attribute to be populated by the gameReportGenerator
    contributionValue.setAttribute('data-jackpot-contribution-placeholder', 'true');
    contributionValue.textContent = 'Carregando...';
    contributionValue.style.fontWeight = 'bold';
    contributionValue.style.color = '#C0C0C0'; // Silver color for contribution
    
    contributionRow.appendChild(contributionLabel);
    contributionRow.appendChild(contributionValue);
    summary.appendChild(contributionRow);
    
    // Jackpot value
    const jackpotRow = document.createElement('div');
    jackpotRow.style.display = 'flex';
    jackpotRow.style.justifyContent = 'space-between';
    jackpotRow.style.marginTop = '4px';
    
    const jackpotLabel = document.createElement('div');
    jackpotLabel.textContent = 'Jackpot Acumulado:';
    jackpotLabel.style.color = '#8E9196';
    
    const jackpotValue = document.createElement('div');
    
    // Use a data attribute to be populated by the gameReportGenerator
    jackpotValue.setAttribute('data-jackpot-placeholder', 'true');
    jackpotValue.textContent = 'Carregando...';
    jackpotValue.style.fontWeight = 'bold';
    jackpotValue.style.color = '#FFD700'; // Gold color for jackpot
    jackpotValue.style.fontSize = '14px';
    
    jackpotRow.appendChild(jackpotLabel);
    jackpotRow.appendChild(jackpotValue);
    summary.appendChild(jackpotRow);
  }
  
  return summary;
};
