import { EliminationRewardConfig } from "@/lib/db/models";

export interface EliminationRewardResult {
  rewards: number;
  value: number;
  type: 'points' | 'money';
}

export function calculateEliminationRewards(
  playerEliminations: number,
  config?: EliminationRewardConfig
): EliminationRewardResult {
  // Retorna 0 se não houver configuração ou estiver desabilitado
  if (!config || !config.enabled || playerEliminations === 0) {
    return { rewards: 0, value: 0, type: 'points' };
  }

  // Validar frequência (deve ser pelo menos 1)
  const frequency = Math.max(1, config.frequency);
  
  // Calcular quantas recompensas o jogador ganhou
  let rewards = Math.floor(playerEliminations / frequency);
  
  // Aplicar limite máximo se configurado (0 = sem limite)
  if (config.maxRewardsPerGame > 0) {
    rewards = Math.min(rewards, config.maxRewardsPerGame);
  }
  
  // Calcular valor total
  const value = rewards * config.rewardValue;
  
  return {
    rewards,
    value,
    type: config.rewardType
  };
}

export function useEliminationRewards(config?: EliminationRewardConfig) {
  /**
   * Calcula as recompensas de eliminação para um jogador
   * @param playerEliminations - Número de eliminações do jogador
   * @returns Objeto com quantidade de recompensas, valor total e tipo
   */
  const calculate = (playerEliminations: number): EliminationRewardResult => {
    return calculateEliminationRewards(playerEliminations, config);
  };

  /**
   * Calcula recompensas para múltiplos jogadores
   * @param eliminationsByPlayer - Mapa de playerId para número de eliminações
   * @returns Mapa de playerId para resultado de recompensa
   */
  const calculateForPlayers = (
    eliminationsByPlayer: Record<string, number>
  ): Record<string, EliminationRewardResult> => {
    const results: Record<string, EliminationRewardResult> = {};
    
    for (const [playerId, eliminations] of Object.entries(eliminationsByPlayer)) {
      results[playerId] = calculate(eliminations);
    }
    
    return results;
  };

  return {
    calculate,
    calculateForPlayers,
    isEnabled: config?.enabled ?? false
  };
}
