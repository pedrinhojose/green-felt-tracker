
import { Card, CardContent } from "@/components/ui/card";
import { usePoker } from "@/contexts/PokerContext";
import CircularTimer from "./CircularTimer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BlindTimer() {
  const { activeSeason } = usePoker();
  const isMobile = useIsMobile();
  
  console.log("=== BLIND TIMER DEBUG - COMPONENTE ===");
  console.log("BlindTimer component rendering");
  console.log("Active season:", activeSeason?.name);
  console.log("Blind structure from season (RAW):", activeSeason?.blindStructure);
  
  // Log detalhado da estrutura de blinds RAW
  if (activeSeason?.blindStructure) {
    console.log("Estrutura de blinds RAW - detalhes:");
    activeSeason.blindStructure.forEach((blind, index) => {
      console.log(`RAW Blind ${index}:`, {
        id: blind.id,
        level: blind.level,
        smallBlind: blind.smallBlind,
        bigBlind: blind.bigBlind,
        ante: blind.ante,
        duration: blind.duration,
        isBreak: blind.isBreak,
        typeOf_level: typeof blind.level,
        typeOf_smallBlind: typeof blind.smallBlind,
        typeOf_bigBlind: typeof blind.bigBlind
      });
    });
  }
  
  // If there's no active season or blind structure, show a fallback component
  if (!activeSeason || !activeSeason.blindStructure || activeSeason.blindStructure.length === 0) {
    console.log("No active season or blind structure found");
    return (
      <Card className="bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep border border-poker-gold/20">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
          <p className="text-white">Estrutura de blinds não configurada para esta temporada</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-poker-dark-green to-poker-dark-green-deep flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <CircularTimer />
      </div>
    </div>
  );
}
