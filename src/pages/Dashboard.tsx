
import { useState, useEffect } from "react";
import JackpotCard from "@/components/JackpotCard";
import LastGameCard from "@/components/LastGameCard";
import RankingCard from "@/components/RankingCard";
import BackupButton from "@/components/BackupButton";
import RestoreButton from "@/components/RestoreButton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { usePoker } from "@/contexts/PokerContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { activeSeason, isLoading, updateSeason } = usePoker();
  const [error, setError] = useState<Error | null>(null);

  // Clear error if component unmounts or data loads successfully
  useEffect(() => {
    if (!isLoading) {
      setError(null);
    }
    
    return () => setError(null);
  }, [isLoading]);

  // Handle global errors that might happen during data fetching
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-poker-gold"></div>
        <p className="mt-4 text-muted-foreground">Carregando o painel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.
          {error.message && (
            <pre className="mt-2 p-2 bg-muted/30 overflow-auto text-xs">
              {error.message}
            </pre>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DashboardHeader />
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">
          {activeSeason ? activeSeason.name : 'Bem-vindo ao APA Poker'}
        </h2>
        <p className="text-muted-foreground">
          {activeSeason 
            ? `Temporada ativa desde ${new Date(activeSeason.startDate).toLocaleDateString()}`
            : 'Nenhuma temporada ativa. Crie uma nova na seção "Temporada".'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <JackpotCard />
        <RankingCard />
        <LastGameCard />
      </div>
      
      <div className="mt-8">
        <div className="bg-poker-navy/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gerenciamento de Dados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BackupButton />
            <RestoreButton />
          </div>
        </div>
      </div>
    </>
  );
}
