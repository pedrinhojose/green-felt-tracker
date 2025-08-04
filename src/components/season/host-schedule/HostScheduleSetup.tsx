import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Shuffle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HostScheduleEntry, Player, Season } from "@/lib/db/models";
import { generateScheduleDates, shufflePlayersToSchedule } from "./utils/scheduleUtils";

interface HostScheduleSetupProps {
  season: Season;
  players: Player[];
  hostSchedule: HostScheduleEntry[];
  onUpdateHostSchedule: (schedule: HostScheduleEntry[]) => void;
}

export function HostScheduleSetup({ 
  season, 
  players, 
  hostSchedule, 
  onUpdateHostSchedule 
}: HostScheduleSetupProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(season.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(season.endDate || undefined);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSchedule = async () => {
    if (!startDate || !endDate) return;

    setIsGenerating(true);
    try {
      // Gerar datas baseado na frequência
      const dates = generateScheduleDates(startDate, endDate, frequency);
      
      // Criar cronograma com jogadores vazios primeiro
      const newSchedule: HostScheduleEntry[] = dates.map((date, index) => ({
        id: `host_${index + 1}`,
        playerId: '',
        playerName: '',
        scheduledDate: date,
        status: 'scheduled',
        notes: ''
      }));

      onUpdateHostSchedule(newSchedule);
    } finally {
      setIsGenerating(false);
    }
  };

  const randomizeHosts = () => {
    if (hostSchedule.length === 0 || players.length === 0) return;

    setIsGenerating(true);
    try {
      const shuffledSchedule = shufflePlayersToSchedule(hostSchedule, players);
      onUpdateHostSchedule(shuffledSchedule);
    } finally {
      setIsGenerating(false);
    }
  };

  const activePlayers = players; // Todos os players da temporada

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Inicial */}
        <div className="space-y-2">
          <Label>Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Final */}
        <div className="space-y-2">
          <Label>Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Frequência */}
      <div className="space-y-2">
        <Label>Frequência das Partidas</Label>
        <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a frequência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="biweekly">Quinzenal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status dos Jogadores */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>{activePlayers.length} jogadores</strong> ativos encontrados na temporada.
          {activePlayers.length === 0 && " Adicione jogadores primeiro para poder sortear anfitriões."}
        </AlertDescription>
      </Alert>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={generateSchedule}
          disabled={!startDate || !endDate || isGenerating}
          className="flex-1"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isGenerating ? "Gerando..." : "Gerar Cronograma"}
        </Button>

        <Button 
          variant="secondary"
          onClick={randomizeHosts}
          disabled={hostSchedule.length === 0 || activePlayers.length === 0 || isGenerating}
          className="flex-1"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          {isGenerating ? "Sorteando..." : "Sorteio Aleatório"}
        </Button>
      </div>

      {/* Preview das Datas */}
      {startDate && endDate && (
        <div className="text-sm text-muted-foreground">
          <p>
            Preview: {frequency === 'daily' ? 'Diário' : 
                     frequency === 'weekly' ? 'Toda semana' : 
                     frequency === 'biweekly' ? 'A cada 2 semanas' : 
                     'Todo mês'} de {format(startDate, "dd/MM/yyyy", { locale: ptBR })} 
            até {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      )}
    </div>
  );
}