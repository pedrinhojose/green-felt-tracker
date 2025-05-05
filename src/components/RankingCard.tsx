
import { usePoker } from "@/contexts/PokerContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RankingCard() {
  const { rankings, players } = usePoker();
  
  // Get top 3 players from ranking
  const topPlayers = rankings
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 3);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="card-dashboard">
      <h3 className="card-dashboard-header">Top 3 Provisório</h3>
      
      {topPlayers.length > 0 ? (
        <div className="flex flex-col divide-y divide-poker-dark-green">
          {topPlayers.map((player, index) => (
            <div key={player.playerId} className="py-2 flex items-center">
              <div className="w-8 text-center font-semibold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              
              <Avatar className="h-10 w-10">
                {player.photoUrl ? (
                  <AvatarImage src={player.photoUrl} alt={player.playerName} />
                ) : null}
                <AvatarFallback className="bg-poker-navy text-white">
                  {getInitials(player.playerName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-1">
                <div className="font-medium">{player.playerName}</div>
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
