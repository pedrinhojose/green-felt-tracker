
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import RankingTable from "@/components/ranking/RankingTable";
import RankingExporter from "@/components/ranking/RankingExporter";
import RankingRecalculateButton from "@/components/ranking/RankingRecalculateButton";
import EmptyRanking from "@/components/ranking/EmptyRanking";
import { RankingPagination } from "@/components/ranking/RankingPagination";

export default function RankingPage() {
  const { rankings, activeSeason } = usePoker();
  const [sortedRankings, setSortedRankings] = useState(rankings);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  useEffect(() => {
    // Sort rankings by total points in descending order
    const sorted = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
    setSortedRankings(sorted);
    
    // Debug para verificar os dados
    console.log("Rankings atualizados:", rankings);
    console.log("Temporada ativa:", activeSeason?.id);
  }, [rankings, activeSeason]);
  
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

  // Calcular o número total de páginas
  const totalPages = Math.ceil(sortedRankings.length / pageSize);

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking</h2>
          <p className="text-muted-foreground">
            {activeSeason ? activeSeason.name : 'Nenhuma temporada ativa'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <RankingRecalculateButton />
          <RankingExporter
            sortedRankings={sortedRankings}
            activeSeason={activeSeason}
            getInitials={getInitials}
            getMedalEmoji={getMedalEmoji}
          />
        </div>
      </div>
      
      {sortedRankings.length > 0 ? (
        <>
          <RankingTable
            sortedRankings={sortedRankings}
            currentPage={currentPage}
            pageSize={pageSize}
            getInitials={getInitials}
            getMedalEmoji={getMedalEmoji}
          />
          
          {totalPages > 1 && (
            <RankingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <EmptyRanking activeSeason={!!activeSeason} />
      )}
    </div>
  );
}
