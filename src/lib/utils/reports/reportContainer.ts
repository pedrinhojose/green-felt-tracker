
/**
 * Creates the main container for the report
 * @returns A div element with styling for the report
 */
export const createReportContainer = () => {
  const container = document.createElement('div');
  container.style.backgroundColor = '#1a2e35';
  container.style.color = '#FFFFFF';
  container.style.fontFamily = 'Inter, Arial, sans-serif';
  container.style.padding = '24px';
  container.style.maxWidth = '700px'; // Aumentando a largura máxima para acomodar todas as colunas
  container.style.margin = '0 auto';
  container.style.borderRadius = '8px';
  container.style.boxSizing = 'border-box';
  return container;
};
