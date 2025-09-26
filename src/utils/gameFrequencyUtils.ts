/**
 * Utility functions for game frequency calculations
 */

export type GameFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/**
 * Converts game frequency and games per period to equivalent games per week
 * This is used to maintain compatibility with existing calculations
 */
export function getGamesPerWeek(frequency: GameFrequency, gamesPerPeriod: number): number {
  const multipliers = {
    'daily': 7,
    'weekly': 1,
    'biweekly': 0.5,
    'monthly': 0.25
  };
  
  return gamesPerPeriod * multipliers[frequency];
}

/**
 * Gets user-friendly display text for game frequency
 */
export function getFrequencyDisplayText(frequency: GameFrequency): string {
  const displayTexts = {
    'daily': 'Diária',
    'weekly': 'Semanal', 
    'biweekly': 'Quinzenal',
    'monthly': 'Mensal'
  };
  
  return displayTexts[frequency];
}

/**
 * Calculates the interval in days for the frequency
 */
export function getFrequencyIntervalDays(frequency: GameFrequency): number {
  const intervals = {
    'daily': 1,
    'weekly': 7,
    'biweekly': 14,
    'monthly': 30
  };
  
  return intervals[frequency];
}

/**
 * Migrates old gamesPerWeek value to new frequency structure
 */
export function migrateGamesPerWeek(gamesPerWeek: number): { frequency: GameFrequency; gamesPerPeriod: number } {
  if (gamesPerWeek >= 7) {
    return { frequency: 'daily', gamesPerPeriod: 1 };
  } else if (gamesPerWeek >= 1) {
    return { frequency: 'weekly', gamesPerPeriod: gamesPerWeek };
  } else {
    // For fractional values, assume monthly or biweekly
    return { frequency: 'monthly', gamesPerPeriod: 1 };
  }
}