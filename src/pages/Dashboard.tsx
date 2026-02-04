import { useState, useEffect, useRef } from "react";
import JackpotCard from "@/components/JackpotCard";
import CaixinhaCard from "@/components/CaixinhaCard";
import LastGameCard from "@/components/LastGameCard";
import RankingCard from "@/components/RankingCard";
import { UpcomingDinnerCard } from "@/components/UpcomingDinnerCard";
import { BirthdayReminderCard } from "@/components/BirthdayReminderCard";
import BackupButton from "@/components/BackupButton";
import RestoreButton from "@/components/RestoreButton";
import { DashboardHeader } from "@/components/DashboardHeader";
import { usePoker } from "@/contexts/PokerContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRankingSync } from "@/hooks/useRankingSync";
import { toast } from "@/hooks/use-toast";
import { isSameDay } from "date-fns";

export default function Dashboard() {
  const { activeSeason, isLoading, updateSeason, players, setCaixinhaBalance, recalculateSeasonJackpot, fixSeasonJackpot } = usePoker();
  const { validateRankingConsistency } = useRankingSync();
  const [error, setError] = useState<Error | null>(null);
  const birthdayToastShown = useRef(false);
  const caixinhaFixApplied = useRef(false);
  const jackpotFixApplied = useRef(false);

  // One-time fix: Transfer caixinha balance from previous season (2ª Temporada 2025)
  useEffect(() => {
    if (caixinhaFixApplied.current || isLoading || !activeSeason) return;
    
    const fixKey = `caixinha_fix_applied_${activeSeason.id}`;
    const alreadyFixed = localStorage.getItem(fixKey);
    
    if (!alreadyFixed && activeSeason.name === '1ª Temporada de 2026 A' && (activeSeason.caixinhaBalance || 0) === 0) {
      caixinhaFixApplied.current = true;
      // Calculated balance: 235 players * R$10 = R$2350 + R$635 deposits - R$875 withdrawals = R$2110
      const transferAmount = 2110;
      
      console.log(`Applying one-time caixinha fix: R$ ${transferAmount}`);
      setCaixinhaBalance(activeSeason.id, transferAmount);
      localStorage.setItem(fixKey, 'true');
    }
  }, [activeSeason, isLoading, setCaixinhaBalance]);

  // Auto-fix jackpot if incorrect
  useEffect(() => {
    const verifyAndFixJackpot = async () => {
      if (jackpotFixApplied.current || isLoading || !activeSeason) return;
      
      try {
        const correctJackpot = await recalculateSeasonJackpot(activeSeason.id);
        
        // Se o valor está incorreto, corrigir automaticamente
        if (Math.abs(correctJackpot - activeSeason.jackpot) > 0.01) {
          jackpotFixApplied.current = true;
          console.log(`Jackpot incorreto detectado: atual=${activeSeason.jackpot}, correto=${correctJackpot}`);
          await fixSeasonJackpot(activeSeason.id);
        }
      } catch (error) {
        console.error("Erro ao verificar jackpot:", error);
      }
    };
    
    verifyAndFixJackpot();
  }, [activeSeason, isLoading, recalculateSeasonJackpot, fixSeasonJackpot]);
  useEffect(() => {
    if (birthdayToastShown.current || isLoading || players.length === 0) return;
    
    const today = new Date();
    const birthdayPlayers = players.filter(player => {
      if (!player.birthDate) return false;
      // Parse date as local to avoid timezone issues
      const dateStr = String(player.birthDate);
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      return isSameDay(thisYearBirthday, today);
    });

    if (birthdayPlayers.length > 0) {
      birthdayToastShown.current = true;
      const names = birthdayPlayers.map(p => p.name).join(", ");
      toast({
        title: "🎂 Aniversariante(s) do dia!",
        description: `Hoje é aniversário de: ${names}`,
        duration: 8000,
      });
    }
  }, [players, isLoading]);

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

  useEffect(() => {
    if (activeSeason?.id) {
      validateRankingConsistency(activeSeason.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSeason?.id]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <JackpotCard />
        <CaixinhaCard />
        <RankingCard />
        <LastGameCard />
      </div>
      
      {activeSeason && activeSeason.hostSchedule && activeSeason.hostSchedule.length > 0 && (
        <div className="mt-6">
          <UpcomingDinnerCard />
        </div>
      )}
      
      <div className="mt-6">
        <BirthdayReminderCard />
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
