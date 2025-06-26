
/**
 * Utilitários para formatação e parsing de valores de blind
 */

// Configuração: valores >= 1000 usam notação K
const MIN_VALUE_FOR_K_NOTATION = 1000;

/**
 * Formata um valor numérico para notação K quando apropriado
 * @param value - Valor numérico
 * @returns String formatada (ex: 1000 -> "1K", 500 -> "500")
 */
export function formatBlindValue(value: number): string {
  if (value >= MIN_VALUE_FOR_K_NOTATION) {
    if (value % 1000 === 0) {
      // Valores exatos como 1000, 2000, etc.
      return `${value / 1000}K`;
    } else {
      // Valores como 1500, 2500, etc.
      const kValue = value / 1000;
      // Remove zeros desnecessários após o ponto decimal
      return `${kValue % 1 === 0 ? kValue : kValue.toFixed(1)}K`;
    }
  }
  return value.toString();
}

/**
 * Converte entrada de string (que pode conter K) para valor numérico
 * @param input - String de entrada (ex: "1K", "1.5K", "500")
 * @returns Valor numérico ou null se inválido
 */
export function parseBlindValue(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmedInput = input.trim().toUpperCase();
  
  // Se termina com K
  if (trimmedInput.endsWith('K')) {
    const numericPart = trimmedInput.slice(0, -1);
    const parsedValue = parseFloat(numericPart);
    
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return null;
    }
    
    return parsedValue * 1000;
  }
  
  // Valor numérico direto
  const parsedValue = parseInt(trimmedInput, 10);
  
  if (isNaN(parsedValue) || parsedValue < 0) {
    return null;
  }
  
  return parsedValue;
}

/**
 * Valida se uma entrada é um valor de blind válido
 * @param input - String de entrada
 * @returns true se válido, false caso contrário
 */
export function isValidBlindValue(input: string): boolean {
  return parseBlindValue(input) !== null;
}

/**
 * Formata valores de blind para exibição no formato "SB/BB"
 * @param smallBlind - Valor do small blind
 * @param bigBlind - Valor do big blind
 * @returns String formatada (ex: "1K/2K" ou "500/1000")
 */
export function formatBlindPair(smallBlind: number, bigBlind: number): string {
  return `${formatBlindValue(smallBlind)}/${formatBlindValue(bigBlind)}`;
}
