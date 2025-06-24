
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

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
  const isMobile = useIsMobile();
  
  // Calculate the starting index for the current page
  const startIndex = (currentPage - 1) * pageSize;
  
  // Get only the rankings for the current page
  const currentPageRankings = sortedRankings.slice(startIndex, startIndex + pageSize);
  
  if (isMobile) {
    return (
      <Card className="shadow-mobile">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Classificação</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <div className="space-y-2">
            {currentPageRankings.map((ranking, index) => (
              <Card key={ranking.playerId} className="border-poker-dark-green/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0 text-xs">
                        {getMedalEmoji(startIndex + index)}
                      </Badge>
                    </div>
                    
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {ranking.photoUrl ? (
                        <AvatarImage src={ranking.photoUrl} alt={ranking.playerName} />
                      ) : null}
                      <AvatarFallback className="bg-poker-navy text-white text-xs">
                        {getInitials(ranking.playerName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ranking.playerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {ranking.gamesPlayed} jogos
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-poker-gold text-sm">
                        {ranking.totalPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        pontos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-mobile">
      <CardHeader className="pb-2">
        <CardTitle>Classificação</CardTitle>
      </CardHeader>
      <CardContent className="mobile-card">
        <div id="ranking-table" ref={rankingTableRef} className="mobile-table-container">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-poker-dark-green">
                <TableHead className="w-12 pr-0 py-2">#</TableHead>
                <TableHead className="px-1 py-2">Jogador</TableHead>
                <TableHead className="text-center w-20 py-2">Jogos</TableHead>
                <TableHead className="text-center w-20 py-2">Pontos</TableHead>
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
