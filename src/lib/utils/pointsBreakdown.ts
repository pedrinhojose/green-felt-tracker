import { Game, GamePlayer, RankingEntry, ScoreEntry } from "@/lib/db/models";

export interface PointBreakdown {
  position: number;
  eliminations: number;
  total: number;
}

const asNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && !Number.isNaN(value) ? value : undefined;
};

export const getPositionPoints = (
  scoreSchema: ScoreEntry[] = [],
  position: number | null
): number => {
  if (!position) return 0;
  return scoreSchema.find((entry) => entry.position === position)?.points ?? 0;
};

export const getGamePlayerPointBreakdown = (
  gamePlayer: GamePlayer,
  scoreSchema: ScoreEntry[] = []
): PointBreakdown => {
  const schemaPositionPoints = getPositionPoints(scoreSchema, gamePlayer.position);
  const total = asNumber(gamePlayer.points) ?? schemaPositionPoints;
  const savedPosition = asNumber(gamePlayer.pointsFromPosition);
  const savedEliminations = asNumber(gamePlayer.pointsFromEliminations);

  if (savedPosition !== undefined || savedEliminations !== undefined) {
    const eliminations = savedEliminations ?? Math.max(0, total - (savedPosition ?? schemaPositionPoints));
    const position = savedPosition ?? Math.max(0, total - eliminations);
    return { position, eliminations, total: position + eliminations };
  }

  const eliminations = Math.max(0, total - schemaPositionPoints);
  const position = Math.max(0, total - eliminations);

  return { position, eliminations, total };
};

export const calculateRankingBreakdownFromGames = (
  games: Game[] = [],
  scoreSchema: ScoreEntry[] = []
): Record<string, { position: number; eliminations: number; total: number }> => {
  return games
    .filter((game) => game.isFinished)
    .reduce<Record<string, { position: number; eliminations: number; total: number }>>((acc, game) => {
      game.players.forEach((gamePlayer) => {
        const breakdown = getGamePlayerPointBreakdown(gamePlayer, scoreSchema);
        const current = acc[gamePlayer.playerId] || { position: 0, eliminations: 0, total: 0 };
        current.position += breakdown.position;
        current.eliminations += breakdown.eliminations;
        current.total += breakdown.total;
        acc[gamePlayer.playerId] = current;
      });

      return acc;
    }, {});
};

export const enrichRankingsWithPointBreakdown = (
  rankings: RankingEntry[] = [],
  games: Game[] = [],
  scoreSchema: ScoreEntry[] = []
): RankingEntry[] => {
  const breakdownByPlayer = calculateRankingBreakdownFromGames(games, scoreSchema);

  return rankings.map((ranking) => {
    const breakdown = breakdownByPlayer[ranking.playerId];

    if (!breakdown) {
      return {
        ...ranking,
        pointsFromPosition: ranking.pointsFromPosition ?? ranking.totalPoints,
        pointsFromEliminations: ranking.pointsFromEliminations ?? 0,
      };
    }

    return {
      ...ranking,
      totalPoints: ranking.totalPoints || breakdown.total,
      pointsFromPosition: breakdown.position,
      pointsFromEliminations: breakdown.eliminations,
    };
  });
};

export const hasEliminationPoints = (items: Array<{ pointsFromEliminations?: number }>): boolean => {
  return items.some((item) => (item.pointsFromEliminations ?? 0) > 0);
};