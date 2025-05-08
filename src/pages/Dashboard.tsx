
import JackpotCard from "@/components/JackpotCard";
import LastGameCard from "@/components/LastGameCard";
import RankingCard from "@/components/RankingCard";
import BackupButton from "@/components/BackupButton";
import { usePoker } from "@/contexts/PokerContext";
import PokerNav from "@/components/PokerNav";

export default function Dashboard() {
  const { activeSeason } = usePoker();

  return (
    <>
      <PokerNav />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {activeSeason ? activeSeason.name : 'Bem-vindo ao APA Poker'}
          </h2>
          <p className="text-muted-foreground">
            {activeSeason 
              ? `Temporada ativa desde ${new Date(activeSeason.startDate).toLocaleDateString()}`
              : 'Nenhuma temporada ativa. Crie uma nova na seção "Temporada".'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JackpotCard />
          <RankingCard />
          <LastGameCard />
        </div>
        
        <div className="mt-6">
          <BackupButton />
        </div>
      </div>
    </>
  );
}
