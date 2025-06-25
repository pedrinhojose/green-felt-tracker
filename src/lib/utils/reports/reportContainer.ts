
/**
 * Creates the main container for the report
 * @returns A div element with styling for the report
 */
export const createReportContainer = () => {
  const container = document.createElement('div');
  container.style.backgroundColor = '#1a1f2c'; // Cor de fundo mais escura como na imagem
  container.style.color = '#FFFFFF';
  container.style.fontFamily = 'Inter, Arial, sans-serif';
  container.style.padding = '20px'; // Aumentando o padding para dar mais espaço
  container.style.maxWidth = '600px'; // Aumentando largura máxima
  container.style.margin = '0 auto';
  container.style.borderRadius = '8px';
  container.style.boxSizing = 'border-box';
  container.style.minHeight = 'auto'; // Permitir altura automática
  container.style.overflow = 'visible'; // Garantir que conteúdo não seja cortado
  container.style.paddingBottom = '30px'; // Padding extra na parte inferior
  return container;
};
