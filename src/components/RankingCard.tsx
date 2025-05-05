
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
      await downloadRankingAsImage(topPlayers, activeSeason, getInitials, getMedalEmoji);
    } catch (error) {
      console.error("Erro ao exportar top 3:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to get position-specific styling
  const getPositionStyles = (index) => {
    switch (index) {
      case 0: return "bg-poker-gold/10 border-poker-gold";
      case 1: return "bg-gray-400/10 border-gray-400";
      case 2: return "bg-amber-700/10 border-amber-700";
      default: return "bg-white/10 border-white/10";
    }
  };

  const renderPodium = () => {
    if (topPlayers.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Sem ranking disponível
        </div>
      );
    }

    // Organize players for new podium layout
    const firstPlace = topPlayers[0] || null;
    const secondPlace = topPlayers[1] || null;
    const thirdPlace = topPlayers[2] || null;

    return (
      <div className="flex flex-col items-center">
        {/* Nova estrutura do pódio com 1º no centro e 2º e 3º em lados opostos */}
        <div className="flex items-end justify-center gap-4 w-full">
          {/* Second place (left side) */}
          {secondPlace && (
            <div className="flex flex-col items-center mb-2">
              <Avatar className="h-12 w-12 border-2 border-gray-400">
                {secondPlace.photoUrl ? (
                  <AvatarImage src={secondPlace.photoUrl} alt={secondPlace.playerName} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white">
                  {getInitials(secondPlace.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-1 text-base font-bold text-gray-400">🥈</div>
              <div className="mt-1 text-center">
                <div className="font-medium text-white truncate max-w-[80px]">{secondPlace.playerName}</div>
                <div className="font-bold text-gray-400">{secondPlace.totalPoints} pts</div>
                <div className="text-xs text-muted-foreground">{secondPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}

          {/* First place (center) */}
          {firstPlace && (
            <div className="flex flex-col items-center z-10">
              <Avatar className="h-16 w-16 border-2 border-poker-gold">
                {firstPlace.photoUrl ? (
                  <AvatarImage src={firstPlace.photoUrl} alt={firstPlace.playerName} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white text-xl">
                  {getInitials(firstPlace.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-1 text-lg font-bold text-poker-gold">🥇</div>
              <div className="mt-1 text-center">
                <div className="font-medium text-white truncate max-w-[100px]">{firstPlace.playerName}</div>
                <div className="font-bold text-poker-gold">{firstPlace.totalPoints} pts</div>
                <div className="text-xs text-muted-foreground">{firstPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}

          {/* Third place (right side) */}
          {thirdPlace && (
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-11 w-11 border-2 border-amber-700">
                {thirdPlace.photoUrl ? (
                  <AvatarImage src={thirdPlace.photoUrl} alt={thirdPlace.playerName} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white">
                  {getInitials(thirdPlace.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-1 text-base font-bold text-amber-700">🥉</div>
              <div className="mt-1 text-center">
                <div className="font-medium text-white truncate max-w-[80px]">{thirdPlace.playerName}</div>
                <div className="font-bold text-amber-700">{thirdPlace.totalPoints} pts</div>
                <div className="text-xs text-muted-foreground">{thirdPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card-dashboard">
      <div className="card-dashboard-header flex justify-between items-center">
        <h3>Top 3</h3>
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
      
      <div className="flex-1 flex items-center justify-center py-4">
        {renderPodium()}
      </div>
    </div>
  );
}
