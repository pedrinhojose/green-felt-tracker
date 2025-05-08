
/**
 * Creates the main container for the report
 * @returns A div element with styling for the report
 */
export const createReportContainer = () => {
  const container = document.createElement('div');
  container.style.backgroundColor = '#1a1f2c'; // Cor de fundo mais escura como na imagem
  container.style.color = '#FFFFFF';
  container.style.fontFamily = 'Inter, Arial, sans-serif';
  container.style.padding = '12px'; // Reduzindo ainda mais o padding
  container.style.maxWidth = '550px'; // Ajustando para o tamanho móvel ideal
  container.style.margin = '0 auto';
  container.style.borderRadius = '8px';
  container.style.boxSizing = 'border-box';
  return container;
};
