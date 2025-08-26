import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { HostScheduleEntry } from "@/lib/db/models";
import { usePoker } from "@/contexts/PokerContext";

export interface AutoGenerateParams {
  startDate: Date;
  endDate: Date;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  participantIds: string[];
}

export function useHostSchedule(
  hostSchedule: HostScheduleEntry[],
  onChange: (hostSchedule: HostScheduleEntry[]) => void
) {
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
  const { players } = usePoker();

  const addEntry = () => {
    const newEntry: HostScheduleEntry = {
      id: uuidv4(),
      playerId: '',
      playerName: '',
      scheduledDate: new Date(),
      status: 'scheduled',
      notes: ''
    };
    
    onChange([...hostSchedule, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<HostScheduleEntry>) => {
    const updated = hostSchedule.map(entry => {
      if (entry.id === id) {
        // Se o playerId mudou, atualizar o playerName também
        if (updates.playerId && updates.playerId !== entry.playerId) {
          const player = players.find(p => p.id === updates.playerId);
          updates.playerName = player?.name || '';
        }
        return { ...entry, ...updates };
      }
      return entry;
    });
    onChange(updated);
  };

  const removeEntry = (id: string) => {
    onChange(hostSchedule.filter(entry => entry.id !== id));
  };

  const generateSchedule = (params: AutoGenerateParams) => {
    const { startDate, endDate, frequency, participantIds } = params;
    
    // Gerar datas baseado na frequência
    const dates = generateDates(startDate, endDate, frequency);
    
    // Obter participantes selecionados
    const participants = players.filter(p => participantIds.includes(p.id));
    
    if (participants.length === 0) {
      return;
    }
    
    // Embaralhar participantes para randomizar
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    
    // Distribuir participantes pelas datas (round-robin)
    const newSchedule: HostScheduleEntry[] = dates.map((date, index) => {
      const participant = shuffledParticipants[index % shuffledParticipants.length];
      
      return {
        id: uuidv4(),
        playerId: participant.id,
        playerName: participant.name,
        scheduledDate: date,
        status: 'scheduled' as const,
        notes: `Gerado automaticamente em ${new Date().toLocaleDateString()}`
      };
    });
    
    onChange(newSchedule);
    setIsAutoGenerateOpen(false);
  };

  const generateDates = (startDate: Date, endDate: Date, frequency: string): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    // Definir incremento baseado na frequência
    let incrementDays: number;
    switch (frequency) {
      case 'weekly':
        incrementDays = 7;
        break;
      case 'biweekly':
        incrementDays = 14;
        break;
      case 'monthly':
        incrementDays = 30; // Aproximadamente mensal
        break;
      default:
        incrementDays = 7;
    }
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + incrementDays);
    }
    
    return dates;
  };

  return {
    isAutoGenerateOpen,
    setIsAutoGenerateOpen,
    addEntry,
    updateEntry,
    removeEntry,
    generateSchedule
  };
}