
import { Game, Player } from '../../db/models';
import { createReportContainer } from './reportContainer';
import { createReportHeader } from './reportHeader';
import { createPlayersTable } from './playersTable';
import { createReportSummary } from './reportSummary';
import { createReportFooter } from './reportFooter';
import { pokerDB } from '../../db';
import { formatCurrency } from '../dateUtils';

/**
 * Generates the complete game report
 * @param game The game object
 * @param players Array of all players
 * @param seasonName Name of the season
 * @returns A complete HTML element for the report
 */
export const createGameReport = async (game: Game, players: Player[], seasonName: string) => {
  const container = createReportContainer();
  
  // Add header
  container.appendChild(createReportHeader(game, seasonName));
  
  // Add players table
  container.appendChild(createPlayersTable(game, players));
  
  // Add summary with players for winner info
  const summarySection = createReportSummary(game, players);
  container.appendChild(summarySection);
  
  // Add footer
  container.appendChild(createReportFooter());
  
  // Get current jackpot value and contribution from season
  if (game.seasonId) {
    try {
      const season = await pokerDB.getSeason(game.seasonId);
      if (season) {
        // Calculate jackpot contribution for this game
        const playerCount = game.players.filter(p => p.buyIn).length;
        const jackpotContribution = playerCount * season.financialParams.jackpotContribution;
        
        // Find the jackpot contribution placeholder and update it
        const contributionElement = summarySection.querySelector('[data-jackpot-contribution-placeholder="true"]');
        if (contributionElement) {
          contributionElement.textContent = formatCurrency(jackpotContribution);
        }
        
        // Find the jackpot placeholder and update it
        const jackpotElement = summarySection.querySelector('[data-jackpot-placeholder="true"]');
        if (jackpotElement) {
          jackpotElement.textContent = formatCurrency(season.jackpot || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching season data for jackpot:', error);
    }
  }
  
  return container;
};
