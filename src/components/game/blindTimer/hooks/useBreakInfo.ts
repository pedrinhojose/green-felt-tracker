
import { BlindLevel } from "@/lib/db/models";

export interface BreakInfo {
  nextBreak: BlindLevel | null;
  levelsUntilBreak: number | null;
}

export function useBreakInfo(
  blindLevels: BlindLevel[],
  currentLevelIndex: number
): BreakInfo {
  try {
    // Validação de entrada
    if (!Array.isArray(blindLevels) || blindLevels.length === 0 || 
        currentLevelIndex < 0 || currentLevelIndex >= blindLevels.length) {
      console.log("useBreakInfo: Dados inválidos", { 
        hasBlindLevels: Array.isArray(blindLevels) && blindLevels.length > 0,
        currentLevelIndex
      });
      return { nextBreak: null, levelsUntilBreak: null };
    }
    
    // Encontra o próximo intervalo a partir do nível atual
    let nextBreakIndex = -1;
    for (let i = currentLevelIndex + 1; i < blindLevels.length; i++) {
      if (blindLevels[i] && blindLevels[i].isBreak) {
        nextBreakIndex = i;
        break;
      }
    }
    
    const nextBreak = nextBreakIndex !== -1 ? blindLevels[nextBreakIndex] : null;
    const levelsUntilBreak = nextBreakIndex !== -1 ? nextBreakIndex - currentLevelIndex : null;

    return {
      nextBreak,
      levelsUntilBreak,
    };
  } catch (error) {
    console.error("Erro em useBreakInfo:", error);
    return { nextBreak: null, levelsUntilBreak: null };
  }
}
