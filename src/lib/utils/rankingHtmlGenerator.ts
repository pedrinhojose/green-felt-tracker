
import { Season } from '../db/models';

/**
 * Cria o container principal para o ranking - OTIMIZADO PARA MOBILE
 */
export const createRankingContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  
  // Remover limitações de largura fixa
  container.style.cssText = `
    background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-width: 600px;
    width: max-content;
    padding: 24px;
    margin: 0;
    box-sizing: border-box;
    overflow: visible;
    position: relative;
  `;
  
  return container;
};

/**
 * Cria o cabeçalho do ranking
 */
export const createRankingHeader = (activeSeason: Season | null): HTMLDivElement => {
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  
  const title = document.createElement('h1');
  title.style.cssText = `
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 8px 0;
    color: #f59e0b;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  `;
  title.textContent = '🏆 RANKING DE PONTOS';
  
  const seasonName = document.createElement('p');
  seasonName.style.cssText = `
    font-size: 16px;
    margin: 0 0 8px 0;
    color: #d1d5db;
    font-weight: 500;
  `;
  seasonName.textContent = activeSeason?.name || 'Temporada Atual';
  
  const date = document.createElement('p');
  date.style.cssText = `
    font-size: 12px;
    margin: 0;
    color: #9ca3af;
    font-style: italic;
  `;
  date.textContent = `Atualizado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
  
  header.appendChild(title);
  header.appendChild(seasonName);
  header.appendChild(date);
  
  return header;
};

/**
 * Cria o rodapé do ranking
 */
export const createRankingFooter = (): HTMLDivElement => {
  const footer = document.createElement('div');
  footer.style.cssText = `
    text-align: center;
    margin-top: 24px;
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #9ca3af;
    font-size: 11px;
    font-style: italic;
  `;
  
  footer.textContent = `Ranking gerado automaticamente • ${new Date().toLocaleDateString('pt-BR')}`;
  
  return footer;
};
