import { Player, Season, Game, MembershipCharge } from "@/lib/db/models";
import { startOfWeek, startOfMonth, startOfQuarter, isAfter, isBefore, parseISO, format, endOfWeek, endOfMonth, endOfQuarter, subDays, subMonths, subQuarters } from "date-fns";
import { ptBR } from "date-fns/locale";
import { pokerDB } from "@/lib/db";

/**
 * Verifica se um jogador participou de pelo menos uma partida no período anterior
 */
export async function hasPlayerParticipatedInPreviousPeriod(
  playerId: string,
  season: Season,
  gameDate: Date
): Promise<boolean> {
  const { clubMembershipFrequency } = season.financialParams;
  
  let previousPeriodStart: Date;
  let previousPeriodEnd: Date;

  switch (clubMembershipFrequency) {
    case 'semanal':
      // Semana anterior
      const previousWeekStart = subDays(startOfWeek(gameDate, { weekStartsOn: 1 }), 7);
      previousPeriodStart = previousWeekStart;
      previousPeriodEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
      break;
    case 'mensal':
      // Mês anterior
      const previousMonthStart = subMonths(startOfMonth(gameDate), 1);
      previousPeriodStart = previousMonthStart;
      previousPeriodEnd = endOfMonth(previousMonthStart);
      break;
    case 'trimestral':
      // Trimestre anterior
      const previousQuarterStart = subQuarters(startOfQuarter(gameDate), 1);
      previousPeriodStart = previousQuarterStart;
      previousPeriodEnd = endOfQuarter(previousQuarterStart);
      break;
    default:
      return false;
  }

  try {
    // Buscar todos os jogos da temporada no período anterior
    const allGames = await pokerDB.getGames(season.id);
    const gamesInPreviousPeriod = allGames.filter(game => {
      const gameDate = typeof game.date === 'string' ? parseISO(game.date) : game.date;
      return gameDate >= previousPeriodStart && gameDate <= previousPeriodEnd;
    });

    // Verificar se o jogador participou de algum jogo
    return gamesInPreviousPeriod.some(game => 
      game.players.some(player => player.playerId === playerId)
    );
  } catch (error) {
    console.error('Erro ao verificar participação no período anterior:', error);
    return false;
  }
}

/**
 * Verifica se um jogador deve ser cobrado mensalidade nesta partida
 * Regras:
 * 1. Primeira cobrança - sempre cobrar
 * 2. Jogador participou do período anterior - cobrar se não foi cobrado no período atual
 * 3. Jogador não participou do período anterior - não cobrar
 */
export async function shouldChargeMembership(
  player: Player,
  season: Season,
  gameDate: Date
): Promise<boolean> {
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

  // Se já foi cobrado no período atual, não cobrar novamente
  const alreadyChargedInCurrentPeriod = !isBefore(lastChargeDate, currentPeriodStart);
  if (alreadyChargedInCurrentPeriod) {
    return false;
  }

  // Verificar se o jogador participou do período anterior
  const participatedInPreviousPeriod = await hasPlayerParticipatedInPreviousPeriod(
    player.id,
    season,
    gameDate
  );

  return participatedInPreviousPeriod;
}

/**
 * Calcula o valor total de mensalidades que serão cobradas
 */
export async function calculateTotalMembershipCharges(
  players: Player[],
  season: Season,
  gameDate: Date
): Promise<{ totalAmount: number; chargedPlayers: Player[]; nonChargedPlayers: { player: Player; reason: string }[] }> {
  const chargedPlayers: Player[] = [];
  const nonChargedPlayers: { player: Player; reason: string }[] = [];

  for (const player of players) {
    const shouldCharge = await shouldChargeMembership(player, season, gameDate);
    
    if (shouldCharge) {
      chargedPlayers.push(player);
    } else {
      let reason = 'Já foi cobrado neste período';
      
      if (!player.lastMembershipCharge) {
        // Se não tem cobrança anterior mas não deve ser cobrado, 
        // significa que não participou do período anterior
        reason = 'Não participou do período anterior';
      } else {
        // Verificar se não participou do período anterior
        const participated = await hasPlayerParticipatedInPreviousPeriod(player.id, season, gameDate);
        if (!participated) {
          reason = 'Não participou do período anterior';
        }
      }
      
      nonChargedPlayers.push({ player, reason });
    }
  }

  const totalAmount = chargedPlayers.length * season.financialParams.clubMembershipValue;

  return { totalAmount, chargedPlayers, nonChargedPlayers };
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