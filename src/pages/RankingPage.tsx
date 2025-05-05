
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RankingPage() {
  const { rankings, activeSeason, players } = usePoker();
  const [sortedRankings, setSortedRankings] = useState(rankings);
  
  useEffect(() => {
    // Sort rankings by total points in descending order
    const sorted = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    setSortedRankings(sorted);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Ranking</h2>
        <p className="text-muted-foreground">
          {activeSeason ? activeSeason.name : 'Nenhuma temporada ativa'}
        </p>
      </div>
      
      {sortedRankings.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-poker-dark-green">
                    <th className="text-left py-2 px-4">#</th>
                    <th className="text-left py-2 px-4">Jogador</th>
                    <th className="text-center py-2 px-4">Jogos</th>
                    <th className="text-center py-2 px-4">Melhor Posição</th>
                    <th className="text-center py-2 px-4">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRankings.map((ranking, index) => (
                    <tr key={ranking.playerId} className="border-b border-poker-dark-green hover:bg-poker-dark-green/30">
                      <td className="py-3 px-4 font-semibold">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-poker-dark-green text-center">
                          {getMedalEmoji(index)}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {ranking.photoUrl ? (
                              <AvatarImage src={ranking.photoUrl} alt={ranking.playerName} />
                            ) : null}
                            <AvatarFallback className="bg-poker-navy text-white">
                              {getInitials(ranking.playerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{ranking.playerName}</div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-center">{ranking.gamesPlayed}</td>
                      
                      <td className="py-3 px-4 text-center">
                        {ranking.bestPosition ? `${ranking.bestPosition}º lugar` : '-'}
                      </td>
                      
                      <td className="py-3 px-4 text-center font-bold text-poker-gold">{ranking.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Nenhuma pontuação registrada ainda</p>
          <Card className="max-w-md mx-auto p-6 bg-poker-dark-green">
            <CardContent className="text-center">
              <p>
                O ranking será atualizado após a finalização das partidas.
                {!activeSeason && ' Crie uma temporada para começar.'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
