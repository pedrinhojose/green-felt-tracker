
/**
 * Creates the main container element for the game report
 */
export const createReportContainer = () => {
  const container = document.createElement('div');
  container.style.width = '360px';
  container.style.padding = '16px';
  container.style.backgroundColor = '#1A1F2C';
  container.style.borderRadius = '12px';
  container.style.color = '#FFFFFF';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  return container;
};
