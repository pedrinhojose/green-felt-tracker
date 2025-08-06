import { Player, Season, Game, MembershipCharge } from "@/lib/db/models";
import { startOfWeek, startOfMonth, startOfQuarter, isAfter, isBefore, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Verifica se um jogador deve ser cobrado mensalidade nesta partida
 */
export function shouldChargeMembership(
  player: Player,
  season: Season,
  gameDate: Date
): boolean {
  const { clubMembershipFrequency } = season.financialParams;
  
  if (!player.lastMembershipCharge) {
    // Primeira cobrança - sempre cobrar
    return true;
  }

  const lastChargeDate = typeof player.lastMembershipCharge === 'string' 
    ? parseISO(player.lastMembershipCharge) 
    : player.lastMembershipCharge;

  let currentPeriodStart: Date;

  switch (clubMembershipFrequency) {
    case 'semanal':
      currentPeriodStart = startOfWeek(gameDate, { weekStartsOn: 1 }); // Segunda-feira
      break;
    case 'mensal':
      currentPeriodStart = startOfMonth(gameDate);
      break;
    case 'trimestral':
      currentPeriodStart = startOfQuarter(gameDate);
      break;
    default:
      return false;
  }

  // Cobrar se a última cobrança foi antes do período atual
  return isBefore(lastChargeDate, currentPeriodStart);
}

/**
 * Calcula o valor total de mensalidades que serão cobradas
 */
export function calculateTotalMembershipCharges(
  players: Player[],
  season: Season,
  gameDate: Date
): { totalAmount: number; chargedPlayers: Player[] } {
  const chargedPlayers = players.filter(player => 
    shouldChargeMembership(player, season, gameDate)
  );

  const totalAmount = chargedPlayers.length * season.financialParams.clubMembershipValue;

  return { totalAmount, chargedPlayers };
}

/**
 * Cria registros de cobrança de mensalidade
 */
export function createMembershipCharges(
  chargedPlayers: Player[],
  season: Season,
  gameDate: Date
): MembershipCharge[] {
  return chargedPlayers.map(player => ({
    playerId: player.id,
    amount: season.financialParams.clubMembershipValue,
    frequency: season.financialParams.clubMembershipFrequency,
    chargedAt: gameDate
  }));
}

/**
 * Formata a frequência para exibição
 */
export function formatMembershipFrequency(frequency: 'semanal' | 'mensal' | 'trimestral'): string {
  const frequencies = {
    semanal: 'Semanal',
    mensal: 'Mensal',
    trimestral: 'Trimestral'
  };
  return frequencies[frequency];
}

/**
 * Calcula o próximo período de cobrança
 */
export function getNextChargePeriod(
  frequency: 'semanal' | 'mensal' | 'trimestral',
  gameDate: Date
): string {
  let nextPeriod: Date;

  switch (frequency) {
    case 'semanal':
      nextPeriod = startOfWeek(gameDate, { weekStartsOn: 1 });
      break;
    case 'mensal':
      nextPeriod = startOfMonth(gameDate);
      break;
    case 'trimestral':
      nextPeriod = startOfQuarter(gameDate);
      break;
  }

  return format(nextPeriod, "dd/MM/yyyy", { locale: ptBR });
}