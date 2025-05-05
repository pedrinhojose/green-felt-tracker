
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingEntry } from "@/lib/db/models";
import { useRef } from "react";

interface RankingTableProps {
  sortedRankings: RankingEntry[];
  currentPage: number;
  pageSize: number;
  getInitials: (name: string) => string;
  getMedalEmoji: (position: number) => string;
}

export default function RankingTable({ 
  sortedRankings, 
  currentPage, 
  pageSize, 
  getInitials, 
  getMedalEmoji 
}: RankingTableProps) {
  const rankingTableRef = useRef<HTMLDivElement>(null);
  
  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * pageSize;
  
  // Get only the rankings for the current page
  const currentPageRankings = sortedRankings.slice(startIndex, startIndex + pageSize);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Classificação</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="ranking-table" ref={rankingTableRef} className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-poker-dark-green">
                <th className="text-left py-2 px-4">#</th>
                <th className="text-left py-2 px-4">Jogador</th>
                <th className="text-center py-2 px-4">Jogos</th>
                <th className="text-center py-2 px-4">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {currentPageRankings.map((ranking, index) => (
                <tr key={ranking.playerId} className="border-b border-poker-dark-green hover:bg-poker-dark-green/30">
                  <td className="py-3 px-4 font-semibold">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-poker-dark-green text-center">
                      {getMedalEmoji(startIndex + index)}
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
                  
                  <td className="py-3 px-4 text-center font-bold text-poker-gold">{ranking.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export { RankingTable };
