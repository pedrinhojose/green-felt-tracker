
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PlayerPerformanceStats } from "@/hooks/useSeasonReport";
import { formatCurrency } from "@/lib/utils/dateUtils";

interface PlayerPerformanceTableProps {
  playerStats: PlayerPerformanceStats[];
}

export default function PlayerPerformanceTable({ playerStats }: PlayerPerformanceTableProps) {
  return (
    <div className="bg-poker-dark-green/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold">Desempenho dos Jogadores</h2>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Estatísticas de desempenho dos jogadores durante a temporada</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Jogos</TableHead>
              <TableHead className="text-center">Vitórias</TableHead>
              <TableHead className="text-center">Posição Média</TableHead>
              <TableHead className="text-center">Pontos</TableHead>
              <TableHead className="text-right">Total Ganhos</TableHead>
              <TableHead className="text-right">Total Perdas</TableHead>
              <TableHead className="text-right">Balanço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerStats.map((player) => (
              <TableRow key={player.playerId}>
                <TableCell className="font-medium">{player.playerName}</TableCell>
                <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                <TableCell className="text-center">{player.victories}</TableCell>
                <TableCell className="text-center">
                  {player.averagePosition > 0 
                    ? player.averagePosition.toFixed(1) 
                    : "-"}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {player.totalPoints || 0}
                </TableCell>
                <TableCell className="text-right text-green-400">
                  {formatCurrency(player.totalWinnings)}
                </TableCell>
                <TableCell className="text-right text-red-400">
                  {formatCurrency(player.totalInvestment)}
                </TableCell>
                <TableCell 
                  className={`text-right font-semibold ${
                    player.balance >= 0 ? 'text-blue-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(player.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
