
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingEntry } from "@/lib/db/models";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <CardContent className="px-4">
        <div id="ranking-table" ref={rankingTableRef} className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-poker-dark-green">
                <TableHead className="w-12 pr-0 py-2">#</TableHead>
                <TableHead className="px-1 py-2">Jogador</TableHead>
                <TableHead className="text-center w-20 py-2">Pontos</TableHead>
                <TableHead className="text-center w-20 py-2">Jogos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageRankings.map((ranking, index) => (
                <TableRow 
                  key={ranking.playerId} 
                  className="border-b border-poker-dark-green hover:bg-poker-dark-green/30"
                >
                  <TableCell className="py-3 pr-1 pl-2 font-semibold w-12">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-poker-dark-green text-center">
                      {getMedalEmoji(startIndex + index)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="py-3 px-1">
                    <div className="flex items-center gap-2">
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
                  </TableCell>
                  
                  <TableCell className="py-3 px-2 text-center w-20">{ranking.gamesPlayed}</TableCell>
                  
                  <TableCell className="py-3 px-2 text-center font-bold text-poker-gold w-20">
                    {ranking.totalPoints}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export { RankingTable };
