
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
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerPerformanceTableProps {
  playerStats: PlayerPerformanceStats[];
}

export default function PlayerPerformanceTable({ playerStats }: PlayerPerformanceTableProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`bg-poker-dark-green/30 rounded-lg overflow-hidden ${isMobile ? 'mx-0' : ''}`}>
      <div className={`p-4 border-b border-white/10 ${isMobile ? 'px-2 py-3' : ''}`}>
        <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-xl'}`}>Desempenho dos Jogadores</h2>
      </div>
      
      <div className={`overflow-x-auto ${isMobile ? 'overflow-x-scroll' : ''}`}>
        <Table className="bg-poker-black">
          <TableCaption className="text-gray-400">Estatísticas de desempenho dos jogadores durante a temporada</TableCaption>
          <TableHeader className="bg-poker-dark-green">
            <TableRow className="bg-poker-dark-green border-white/10 hover:bg-poker-dark-green">
              <TableHead className={`text-white bg-poker-dark-green border-white/10 ${isMobile ? 'text-xs py-2 px-2' : ''}`}>Jogador</TableHead>
              <TableHead className={`text-center text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-8 text-xs py-2 px-1' : 'w-10'}`}>J</TableHead>
              <TableHead className={`text-center text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-8 text-xs py-2 px-1' : 'w-10'}`}>V</TableHead>
              <TableHead className={`text-center text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-8 text-xs py-2 px-1' : 'w-10'}`}>RB</TableHead>
              <TableHead className={`text-center text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-12 text-xs py-2 px-1' : 'w-16'}`}>Pos. Med</TableHead>
              <TableHead className={`text-center text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-12 text-xs py-2 px-1' : 'w-16'}`}>Pontos</TableHead>
              <TableHead className={`text-right text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-16 text-xs py-2 px-1' : 'w-20'}`}>Maior Prêmio</TableHead>
              <TableHead className={`text-right text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-16 text-xs py-2 px-1' : 'w-20'}`}>Ganhos</TableHead>
              <TableHead className={`text-right text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-16 text-xs py-2 px-1' : 'w-20'}`}>Perdas</TableHead>
              <TableHead className={`text-right text-white bg-poker-dark-green border-white/10 ${isMobile ? 'w-16 text-xs py-2 px-1' : 'w-20'}`}>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-poker-black">
            {playerStats.map((player) => (
              <TableRow key={player.playerId} className="bg-poker-black border-white/10 hover:bg-poker-dark-green/20">
                <TableCell className={`font-medium text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-2' : ''}`}>{player.playerName}</TableCell>
                <TableCell className={`text-center text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>{player.gamesPlayed}</TableCell>
                <TableCell className={`text-center text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>{player.victories}</TableCell>
                <TableCell className={`text-center text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>{player.totalRebuys}</TableCell>
                <TableCell className={`text-center text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>
                  {player.averagePosition > 0 
                    ? player.averagePosition.toFixed(1) 
                    : "-"}
                </TableCell>
                <TableCell className={`text-center font-semibold text-white bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>
                  {player.totalPoints || 0}
                </TableCell>
                <TableCell className={`text-right text-poker-gold whitespace-nowrap bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>
                  {isMobile ? formatCurrency(player.biggestPrize).replace('R$', 'R$').replace(',00', '') : formatCurrency(player.biggestPrize)}
                </TableCell>
                <TableCell className={`text-right text-green-400 whitespace-nowrap bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>
                  {isMobile ? formatCurrency(player.totalWinnings).replace('R$', 'R$').replace(',00', '') : formatCurrency(player.totalWinnings)}
                </TableCell>
                <TableCell className={`text-right text-red-400 whitespace-nowrap bg-poker-black border-white/10 ${isMobile ? 'text-xs py-2 px-1' : ''}`}>
                  {isMobile ? formatCurrency(player.totalInvestment).replace('R$', 'R$').replace(',00', '') : formatCurrency(player.totalInvestment)}
                </TableCell>
                <TableCell 
                  className={`text-right font-semibold whitespace-nowrap bg-poker-black border-white/10 ${
                    player.balance >= 0 ? 'text-blue-400' : 'text-red-400'
                  } ${isMobile ? 'text-xs py-2 px-1' : ''}`}
                >
                  {isMobile ? formatCurrency(player.balance).replace('R$', 'R$').replace(',00', '') : formatCurrency(player.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
