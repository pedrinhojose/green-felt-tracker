import { Season, StandaloneGameConfig, PrizeEntry } from "@/lib/db/models";

export const DEFAULT_STANDALONE_SCHEMA: PrizeEntry[] = [
  { position: 1, percentage: 50 },
  { position: 2, percentage: 30 },
  { position: 3, percentage: 20 },
];

/**
 * Cria a configuração de uma partida avulsa a partir da temporada ativa.
 * Copia buy-in, rebuy, add-on, premiação semanal e estrutura de blinds.
 * IGNORA jackpot, caixinha, pontuação/ranking e recompensas de eliminação.
 */
export function standaloneConfigFromSeason(season: Season): StandaloneGameConfig {
  const schema = (season.weeklyPrizeSchema && season.weeklyPrizeSchema.length > 0)
    ? season.weeklyPrizeSchema.map(p => ({ position: p.position, percentage: p.percentage }))
    : DEFAULT_STANDALONE_SCHEMA;

  return {
    buyIn: season.financialParams?.buyIn ?? 0,
    rebuy: season.financialParams?.rebuy ?? 0,
    addon: season.financialParams?.addon ?? 0,
    weeklyPrizeSchema: schema,
    blindStructure: season.blindStructure ?? [],
    source: 'season',
    sourceSeasonName: season.name,
  };
}

/** Uma partida avulsa é considerada configurada quando tem ao menos buy-in ou rebuy definidos. */
export function isStandaloneConfigured(cfg?: StandaloneGameConfig | null): boolean {
  if (!cfg) return false;
  const hasValues = (cfg.buyIn ?? 0) > 0 || (cfg.rebuy ?? 0) > 0 || (cfg.addon ?? 0) > 0;
  const hasSchema = (cfg.weeklyPrizeSchema?.length ?? 0) > 0;
  return hasValues && hasSchema;
}
