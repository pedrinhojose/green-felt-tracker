
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
        <Table className="bg-gray-800">
          <TableCaption className="text-gray-400">Estatísticas de desempenho dos jogadores durante a temporada</TableCaption>
          <TableHeader className="bg-gray-700">
            <TableRow className="bg-gray-700 border-gray-600 hover:bg-gray-700">
              <TableHead className="text-white bg-gray-700">Jogador</TableHead>
              <TableHead className="text-center w-10 text-white bg-gray-700">J</TableHead>
              <TableHead className="text-center w-10 text-white bg-gray-700">V</TableHead>
              <TableHead className="text-center w-10 text-white bg-gray-700">RB</TableHead>
              <TableHead className="text-center w-16 text-white bg-gray-700">Pos. Med</TableHead>
              <TableHead className="text-center w-16 text-white bg-gray-700">Pontos</TableHead>
              <TableHead className="text-right w-20 text-white bg-gray-700">Maior Prêmio</TableHead>
              <TableHead className="text-right w-20 text-white bg-gray-700">Ganhos</TableHead>
              <TableHead className="text-right w-20 text-white bg-gray-700">Perdas</TableHead>
              <TableHead className="text-right w-20 text-white bg-gray-700">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-gray-800">
            {playerStats.map((player) => (
              <TableRow key={player.playerId} className="bg-gray-800 border-gray-700 hover:bg-gray-750">
                <TableCell className="font-medium text-white bg-gray-800">{player.playerName}</TableCell>
                <TableCell className="text-center text-white bg-gray-800">{player.gamesPlayed}</TableCell>
                <TableCell className="text-center text-white bg-gray-800">{player.victories}</TableCell>
                <TableCell className="text-center text-white bg-gray-800">{player.totalRebuys}</TableCell>
                <TableCell className="text-center text-white bg-gray-800">
                  {player.averagePosition > 0 
                    ? player.averagePosition.toFixed(1) 
                    : "-"}
                </TableCell>
                <TableCell className="text-center font-semibold text-white bg-gray-800">
                  {player.totalPoints || 0}
                </TableCell>
                <TableCell className="text-right text-poker-gold whitespace-nowrap bg-gray-800">
                  {formatCurrency(player.biggestPrize)}
                </TableCell>
                <TableCell className="text-right text-green-400 whitespace-nowrap bg-gray-800">
                  {formatCurrency(player.totalWinnings)}
                </TableCell>
                <TableCell className="text-right text-red-400 whitespace-nowrap bg-gray-800">
                  {formatCurrency(player.totalInvestment)}
                </TableCell>
                <TableCell 
                  className={`text-right font-semibold whitespace-nowrap bg-gray-800 ${
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
