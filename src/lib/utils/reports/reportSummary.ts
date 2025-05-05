
import { Game } from '../../db/models';
import { formatCurrency } from '../dateUtils';

/**
 * Creates the summary section with totals
 * @param game The game object
 * @returns A div element with the summary
 */
export const createReportSummary = (game: Game) => {
  const summary = document.createElement('div');
  summary.style.borderTop = '1px solid rgba(255,255,255,0.2)';
  summary.style.paddingTop = '12px';
  
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
