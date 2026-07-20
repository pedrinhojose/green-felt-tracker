
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { RankingEntry } from "@/lib/db/models";

export default function RankingCard() {
  const { rankings } = usePoker();
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState<RankingEntry[]>([]);

  useEffect(() => {
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

  const renderPoints = (player: RankingEntry) => {
    const eliminationPoints = player.pointsFromEliminations ?? 0;
    const positionPoints = player.pointsFromPosition ?? (player.totalPoints - eliminationPoints);

    return (
      <>
        <div className="font-bold text-poker-gold">{player.totalPoints} pts</div>
        {eliminationPoints > 0 && (
          <div className="text-[10px] text-muted-foreground">
            {positionPoints} coloc. + {eliminationPoints} elim.
          </div>
        )}
      </>
    );
  };

  const renderPodium = () => {
    if (topPlayers.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Sem ranking disponível
        </div>
      );
    }

    const firstPlace = topPlayers[0] || null;
    const secondPlace = topPlayers[1] || null;
    const thirdPlace = topPlayers[2] || null;

    return (
      <div className="flex flex-col items-center w-full py-2">
        <div className="flex items-end justify-between w-full relative px-2 pt-10 pb-2">
          {secondPlace && (
            <div className="flex flex-col items-center mb-2 w-1/3 max-w-[90px]">
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
                {renderPoints(secondPlace)}
                <div className="text-xs text-muted-foreground">{secondPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}

          {firstPlace && (
            <div className="flex flex-col items-center z-10 absolute top-[-20px] left-1/2 transform -translate-x-1/2">
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
                {renderPoints(firstPlace)}
                <div className="text-xs text-muted-foreground">{firstPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}

          {thirdPlace && (
            <div className="flex flex-col items-center mb-4 w-1/3 max-w-[90px]">
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
                {renderPoints(thirdPlace)}
                <div className="text-xs text-muted-foreground">{thirdPlace.gamesPlayed} jogos</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleCardClick = () => {
    navigate('/ranking');
  };

  return (
    <div 
      className="card-dashboard cursor-pointer hover:scale-[1.02] transition-all duration-200 ease-out"
      onClick={handleCardClick}
    >
      <div className="card-dashboard-header">
        <h3>Top 3</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-2">
        {renderPodium()}
      </div>
    </div>
  );
}
