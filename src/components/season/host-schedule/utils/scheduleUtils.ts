import { addDays, addWeeks, addMonths, isBefore, startOfDay } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { HostScheduleEntry, Player } from "@/lib/db/models";

export function generateScheduleDates(
  startDate: Date,
  endDate: Date,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
): Date[] {
  const dates: Date[] = [];
  let currentDate = startOfDay(startDate);
  const finalDate = startOfDay(endDate);

  while (isBefore(currentDate, finalDate) || currentDate.getTime() === finalDate.getTime()) {
    dates.push(new Date(currentDate));

    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'biweekly':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  return dates;
}

export function shufflePlayersToSchedule(
  hostSchedule: HostScheduleEntry[],
  players: Player[]
): HostScheduleEntry[] {
  if (hostSchedule.length === 0 || players.length === 0) {
    return hostSchedule;
  }

  // Criar uma lista de jogadores repetidos conforme necessário
  const availablePlayers = repeatPlayersIfNeeded(players, hostSchedule.length);
  
  // Embaralhar os jogadores
  const shuffledPlayers = shuffleArray([...availablePlayers]);

  // Atribuir jogadores às datas
  return hostSchedule.map((entry, index) => ({
    ...entry,
    playerId: shuffledPlayers[index]?.id || '',
    playerName: shuffledPlayers[index]?.name || '',
    status: 'scheduled' as const
  }));
}

function repeatPlayersIfNeeded(players: Player[], neededCount: number): Player[] {
  if (players.length === 0) return [];
  
  const result: Player[] = [];
  let playerIndex = 0;

  for (let i = 0; i < neededCount; i++) {
    result.push(players[playerIndex]);
    playerIndex = (playerIndex + 1) % players.length;
  }

  return result;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function swapHostDates(
  hostSchedule: HostScheduleEntry[],
  entryId1: string,
  entryId2: string
): HostScheduleEntry[] {
  const entry1Index = hostSchedule.findIndex(e => e.id === entryId1);
  const entry2Index = hostSchedule.findIndex(e => e.id === entryId2);

  if (entry1Index === -1 || entry2Index === -1) {
    return hostSchedule;
  }

  const newSchedule = [...hostSchedule];
  const entry1 = newSchedule[entry1Index];
  const entry2 = newSchedule[entry2Index];

  // Trocar apenas os dados do jogador
  newSchedule[entry1Index] = {
    ...entry1,
    playerId: entry2.playerId,
    playerName: entry2.playerName
  };

  newSchedule[entry2Index] = {
    ...entry2,
    playerId: entry1.playerId,
    playerName: entry1.playerName
  };

  return newSchedule;
}