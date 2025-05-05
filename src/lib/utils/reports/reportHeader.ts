import { Game } from '../../db/models';
import { formatDate } from '../dateUtils';

/**
 * Creates the header section of the report with title and date
 * @param game The game object
 * @param seasonName Name of the season
 * @returns A div element with the report header
 */
export const createReportHeader = (game: Game, seasonName: string) => {
  const header = document.createElement('div');
  header.style.marginBottom = '16px';
  header.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
  header.style.paddingBottom = '12px';
  
  // Title
  const title = document.createElement('h2');
  title.textContent = 'Resultados do Poker';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 8px 0';
  title.style.color = '#9b87f5';
  
  // Subtitle with game number, season and date
  const subtitle = document.createElement('div');
  subtitle.textContent = `Partida #${game.number.toString().padStart(3, '0')} - ${seasonName}`;
  subtitle.style.fontSize = '14px';
  subtitle.style.color = '#8E9196';
  
  // Date
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
