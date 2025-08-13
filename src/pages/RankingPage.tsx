
import { useEffect, useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import RankingTable from "@/components/ranking/RankingTable";
import RankingExporter from "@/components/ranking/RankingExporter";
import RankingRecalculateButton from "@/components/ranking/RankingRecalculateButton";
import EmptyRanking from "@/components/ranking/EmptyRanking";
import { RankingPagination } from "@/components/ranking/RankingPagination";
import { useRankingSync } from "@/hooks/useRankingSync";

export default function RankingPage() {
  const { rankings, activeSeason, isLoading } = usePoker();
  const { currentOrganization } = useOrganization();
  const { validateRankingConsistency } = useRankingSync();
  const [sortedRankings, setSortedRankings] = useState(rankings);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  
useEffect(() => {
  // Debug logging
  console.log("RankingPage: Estado atual", {
    organizationId: currentOrganization?.id || 'none',
    organizationName: currentOrganization?.name || 'none',
    activeSeasonId: activeSeason?.id || 'none',
    activeSeasonName: activeSeason?.name || 'none',
    rankingsCount: rankings.length,
    isLoading
  });
  
  // Sort rankings by total points in descending order
  const sorted = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints);
  setSortedRankings(sorted);
  setLastUpdatedAt(new Date());
  
  if (rankings.length > 0) {
    console.log("RankingPage: Rankings encontrados:", rankings.map(r => ({
      playerName: r.playerName,
      totalPoints: r.totalPoints,
      gamesPlayed: r.gamesPlayed
    })));
  }
}, [rankings, activeSeason, currentOrganization, isLoading]);

// Validação automática de consistência ao abrir a página
useEffect(() => {
  if (activeSeason?.id) {
    validateRankingConsistency(activeSeason.id);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeSeason?.id]);
  
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking</h2>
          <p className="text-muted-foreground">
            {activeSeason ? activeSeason.name : 'Nenhuma temporada ativa'}
          </p>
          {currentOrganization && (
            <p className="text-sm text-muted-foreground">
              Organização: {currentOrganization.name}
            </p>
          )}
          {lastUpdatedAt && (
            <p className="text-xs text-muted-foreground">
              Atualizado em {lastUpdatedAt.toLocaleTimeString()}
            </p>
          )}
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
