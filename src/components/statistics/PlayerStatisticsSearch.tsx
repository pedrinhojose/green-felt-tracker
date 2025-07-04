
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PlayerStatisticsSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  loading: boolean;
}

export function PlayerStatisticsSearch({
  searchTerm,
  setSearchTerm,
  loading
}: PlayerStatisticsSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar jogador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-poker-black/50 border-white/10 text-white"
          disabled={loading}
        />
      </div>
    </div>
  );
}
