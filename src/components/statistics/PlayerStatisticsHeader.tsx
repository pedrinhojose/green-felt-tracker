
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlayerStatisticsHeaderProps {
  selectedSeasonId: string;
  setSelectedSeasonId: (value: string) => void;
  activeSeason: any;
  seasons: any[];
  selectedSeason: any;
}

export function PlayerStatisticsHeader({
  selectedSeasonId,
  setSelectedSeasonId,
  activeSeason,
  seasons,
  selectedSeason
}: PlayerStatisticsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Estatísticas dos Jogadores
      </h1>
      
      {/* Seletor de Temporada */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-poker-gold" />
          <span className="text-white/70">Temporada:</span>
        </div>
        <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
          <SelectTrigger className="w-full md:w-64 bg-poker-black/50 border-white/10 text-white">
            <SelectValue placeholder="Selecione uma temporada" />
          </SelectTrigger>
          <SelectContent className="bg-poker-black border-white/10">
            {/* Temporada ativa primeiro */}
            {activeSeason && (
              <SelectItem 
                key={activeSeason.id} 
                value={activeSeason.id}
                className="text-white hover:bg-poker-dark-green/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-poker-gold">●</span>
                  {activeSeason.name} (Ativa)
                </div>
              </SelectItem>
            )}
            
            {/* Temporadas encerradas */}
            {seasons
              .filter(season => !season.isActive && season.id !== activeSeason?.id)
              .sort((a, b) => new Date(b.endDate || b.createdAt).getTime() - new Date(a.endDate || a.createdAt).getTime())
              .map(season => (
                <SelectItem 
                  key={season.id} 
                  value={season.id}
                  className="text-white hover:bg-poker-dark-green/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">○</span>
                    {season.name} (Encerrada)
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-white/70">
        Exibindo dados de: <span className="text-poker-gold">{selectedSeason.name}</span>
        {selectedSeason.id === activeSeason?.id && <span className="text-green-400 ml-2">(Temporada Ativa)</span>}
        {selectedSeason.id !== activeSeason?.id && <span className="text-gray-400 ml-2">(Temporada Encerrada)</span>}
      </p>
    </div>
  );
}
