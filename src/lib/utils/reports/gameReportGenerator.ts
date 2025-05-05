
import { Game, Player } from '../../db/models';
import { createReportContainer } from './reportContainer';
import { createReportHeader } from './reportHeader';
import { createPlayersTable } from './playersTable';
import { createReportSummary } from './reportSummary';
import { createReportFooter } from './reportFooter';

/**
 * Generates the complete game report
 * @param game The game object
 * @param players Array of all players
 * @param seasonName Name of the season
 * @returns A complete HTML element for the report
 */
export const createGameReport = (game: Game, players: Player[], seasonName: string) => {
  const container = createReportContainer();
  
  // Add header
  container.appendChild(createReportHeader(game, seasonName));
  
  // Add players table
  container.appendChild(createPlayersTable(game, players));
  
  // Add summary
  container.appendChild(createReportSummary(game));
  
  // Add footer
  container.appendChild(createReportFooter());
  
  return container;
};
