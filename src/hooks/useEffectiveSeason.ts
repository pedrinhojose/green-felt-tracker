import { usePoker } from "@/contexts/PokerContext";
import { Game, Season, StandaloneGameConfig } from "@/lib/db/models";

/**
 * Retorna uma "temporada efetiva" para os cálculos financeiros / de prêmios da partida.
 * - Partidas vinculadas à temporada: retorna a temporada ativa.
 * - Partidas avulsas: sintetiza uma temporada mínima a partir de game.standaloneConfig.
 */
export function useEffectiveSeason(game: Game | null): Season | null {
  const { activeSeason } = usePoker();

  if (!game) return activeSeason;
  if (!game.isStandalone) return activeSeason;

  const cfg: StandaloneGameConfig = game.standaloneConfig ?? {
    buyIn: 0,
    rebuy: 0,
    addon: 0,
    weeklyPrizeSchema: [
      { position: 1, percentage: 50 },
      { position: 2, percentage: 30 },
      { position: 3, percentage: 20 },
    ],
  };

  const synthetic: Season = {
    id: `standalone-${game.id}`,
    name: `Avulsa #${game.number}`,
    startDate: game.date,
    gameFrequency: "weekly",
    gamesPerPeriod: 1,
    isActive: false,
    scoreSchema: [],
    weeklyPrizeSchema: cfg.weeklyPrizeSchema ?? [],
    seasonPrizeSchema: [],
    financialParams: {
      buyIn: cfg.buyIn ?? 0,
      rebuy: cfg.rebuy ?? 0,
      addon: cfg.addon ?? 0,
      jackpotContribution: 0,
      clubFundContribution: 0,
    },
    blindStructure: [],
    jackpot: 0,
    clubFund: 0,
    houseRules: "",
    hostSchedule: [],
    createdAt: game.createdAt,
  };
  return synthetic;
}
