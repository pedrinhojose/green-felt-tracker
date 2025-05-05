
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRankingExport } from "@/lib/utils/rankingExportUtils";

export default function RankingCard() {
  const { rankings, players, activeSeason } = usePoker();
  const [topPlayers, setTopPlayers] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const { downloadRankingAsImage } = useRankingExport();
  
  useEffect(() => {
    // Get top 3 players from ranking
    const sorted = [...rankings]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);
    
    setTopPlayers(sorted);
  }, [rankings]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return (position + 1).toString();
    }
  };
  
  const handleExportTop3 = async () => {
    try {
      setIsExporting(true);
      // Fixed: Using activeSeason from context instead of calling usePoker() again
      await downloadRankingAsImage(topPlayers, activeSeason, getInitials, getMedalEmoji);
    } catch (error) {
      console.error("Erro ao exportar top 3:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card-dashboard">
      <div className="card-dashboard-header flex justify-between items-center">
        <h3>Top 3 Provisório</h3>
        {topPlayers.length > 0 && (
          <Button 
            onClick={handleExportTop3}
            disabled={isExporting}
            size="sm" 
            variant="outline" 
            className="h-8 px-2 text-xs bg-transparent border border-white/20 hover:bg-white/5"
          >
            <Download className="h-3 w-3 mr-1" />
            Exportar
          </Button>
        )}
      </div>
      
      {topPlayers.length > 0 ? (
        <div className="flex flex-col divide-y divide-white/5">
          {topPlayers.map((player, index) => (
            <div key={player.playerId} className="py-3 flex items-center">
              <div className="w-8 text-center font-semibold">
                {getMedalEmoji(index)}
              </div>
              
              <Avatar className="h-10 w-10 border border-white/10">
                {player.photoUrl ? (
                  <AvatarImage src={player.photoUrl} alt={player.playerName} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white">
                  {getInitials(player.playerName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-1">
                <div className="font-medium text-white">{player.playerName}</div>
              </div>
              
              <div className="font-semibold text-poker-gold">{player.totalPoints} pts</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Sem ranking disponível
        </div>
      )}
    </div>
  );
}
