
/**
 * Creates the footer signature for the report
 * @returns A div element with the footer
 */
export const createReportFooter = () => {
  const footer = document.createElement('div');
  footer.style.marginTop = '16px';
  footer.style.borderTop = '1px solid rgba(255,255,255,0.15)';
  footer.style.paddingTop = '12px';
  footer.style.fontSize = '12px';
  footer.style.color = '#8E9196';
  footer.style.textAlign = 'center';
  
  footer.textContent = 'Gerado pelo APA Poker Club';
  
  return footer;
};
