
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Crown } from "lucide-react";
import { PlayerPerformanceStats } from "@/hooks/reports/types";
import { formatCurrency } from "@/lib/utils/dateUtils";

interface BestWorstPlayersCardProps {
  playerStats: PlayerPerformanceStats[];
}

export default function BestWorstPlayersCard({ playerStats }: BestWorstPlayersCardProps) {
  // Se não houver jogadores, retorna null
  if (!playerStats.length) return null;
  
  // Encontrar o melhor jogador (maior saldo, desempate por número de vitórias)
  const bestPlayer = [...playerStats].sort((a, b) => {
    if (a.balance === b.balance) {
      return b.victories - a.victories;
    }
    return b.balance - a.balance;
  })[0];
  
  // Encontrar o "Rey do Rebuy" (maior número de rebuys)
  const reyDoRebuy = [...playerStats].sort((a, b) => b.totalRebuys - a.totalRebuys)[0];
  
  // Função para obter iniciais do nome para o Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Destaques da Temporada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Melhor Jogador */}
          <div className="bg-poker-green/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-poker-gold flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-poker-gold" />
                Melhor Jogador
              </h3>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Avatar className="h-16 w-16 border-2 border-poker-gold">
                <AvatarImage src={bestPlayer.photoUrl} />
                <AvatarFallback className="bg-blue-800 text-white text-lg">
                  {getInitials(bestPlayer.playerName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-1 items-center space-x-2">
                <div className="flex-1">
                  <h4 className="text-lg font-bold">{bestPlayer.playerName}</h4>
                  <div className="flex flex-col gap-1 mt-1 text-sm">
                    <div><span className="text-gray-300">Saldo: </span> 
                      <span className="font-semibold text-green-400">{formatCurrency(bestPlayer.balance)}</span>
                    </div>
                    <div><span className="text-gray-300">Vitórias: </span> 
                      <span className="font-semibold">{bestPlayer.victories}</span>
                    </div>
                    <div><span className="text-gray-300">Pontos: </span> 
                      <span className="font-semibold text-blue-400">{bestPlayer.totalPoints}</span>
                    </div>
                  </div>
                </div>
                
                <Trophy className="h-5 w-5 text-poker-gold flex-shrink-0" />
              </div>
            </div>
          </div>
          
          {/* Rey do Rebuy */}
          <div className="bg-poker-red/20 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-red-400 flex items-center">
                <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                O Rey do Rebuy
              </h3>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Avatar className="h-16 w-16 border-2 border-red-500">
                <AvatarImage src={reyDoRebuy.photoUrl} />
                <AvatarFallback className="bg-red-900 text-white text-lg">
                  {getInitials(reyDoRebuy.playerName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-1 items-center space-x-2">
                <div className="flex-1">
                  <h4 className="text-lg font-bold">{reyDoRebuy.playerName}</h4>
                  <div className="flex flex-col gap-1 mt-1 text-sm">
                    <div><span className="text-gray-300">Total Rebuys: </span> 
                      <span className="font-semibold text-red-400">{reyDoRebuy.totalRebuys}</span>
                    </div>
                    <div><span className="text-gray-300">Saldo: </span> 
                      <span className="font-semibold">{formatCurrency(reyDoRebuy.balance)}</span>
                    </div>
                    <div><span className="text-gray-300">Jogos: </span> 
                      <span className="font-semibold">{reyDoRebuy.gamesPlayed}</span>
                    </div>
                  </div>
                </div>
                
                <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
