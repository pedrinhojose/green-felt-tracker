
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { BlindLevelConfig } from "@/components/season/BlindLevelConfig";
import { SeasonBasicInfo } from "@/components/season/SeasonBasicInfo";
import { ScoreSchemaConfig } from "@/components/season/ScoreSchemaConfig";
import { PrizeSchemaConfig } from "@/components/season/PrizeSchemaConfig";
import { FinancialParamsConfig } from "@/components/season/FinancialParamsConfig";
import { HouseRulesConfig } from "@/components/season/HouseRulesConfig";
import { JackpotCard } from "@/components/season/JackpotCard";
import { useSeasonForm } from "@/hooks/useSeasonForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SeasonConfig() {
  const { activeSeason, createSeason, updateSeason, endSeason, players } = usePoker();
  const [isCreating, setIsCreating] = useState(!activeSeason);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    errors,
    scoreEntries, 
    setScoreEntries,
    weeklyPrizeEntries, 
    setWeeklyPrizeEntries,
    seasonPrizeEntries, 
    setSeasonPrizeEntries,
    blindLevels, 
    setBlindLevels,
    hostSchedule,
    setHostSchedule,
    
    onSubmit,
  } = useSeasonForm(activeSeason, isCreating, createSeason, updateSeason);

  const handleEndSeason = async () => {
    if (!activeSeason) return;
    
    try {
      setIsSubmitting(true);
      await endSeason(activeSeason.id);
      setIsCreating(true);
    } catch (error) {
      console.error("Error ending season:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isCreating ? 'Nova Temporada' : 'Configuração da Temporada'}
        </h2>
        
        {activeSeason && !isCreating && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(true)}
            >
              Nova Temporada
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Encerrar Temporada</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar Temporada</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja encerrar a temporada atual? O jackpot de {formatCurrency(activeSeason.jackpot)} será distribuído conforme a configuração e o ranking será resetado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSeason}>
                    Encerrar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SeasonBasicInfo register={register} errors={errors} />
        
        <Tabs defaultValue="scores">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scores">Pontuação</TabsTrigger>
            <TabsTrigger value="weekly">Premiação Semanal</TabsTrigger>
            <TabsTrigger value="season">Premiação Final</TabsTrigger>
            <TabsTrigger value="blinds">Estrutura de Blinds</TabsTrigger>
            <TabsTrigger value="rules">Regras da Casa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores">
            <ScoreSchemaConfig 
              scoreEntries={scoreEntries} 
              onChange={setScoreEntries} 
            />
          </TabsContent>
          
          <TabsContent value="weekly">
            <PrizeSchemaConfig 
              entries={weeklyPrizeEntries} 
              onChange={setWeeklyPrizeEntries} 
              title="Premiação Semanal"
            />
          </TabsContent>
          
          <TabsContent value="season">
            <PrizeSchemaConfig 
              entries={seasonPrizeEntries} 
              onChange={setSeasonPrizeEntries} 
              title="Premiação Final da Temporada"
            />
          </TabsContent>
          
          <TabsContent value="blinds">
            <BlindLevelConfig blindLevels={blindLevels} onChange={setBlindLevels} />
          </TabsContent>
          
          <TabsContent value="rules">
            <HouseRulesConfig 
              register={register} 
              errors={errors}
              season={activeSeason}
              players={players}
              hostSchedule={hostSchedule}
              onUpdateHostSchedule={setHostSchedule}
            />
          </TabsContent>
        </Tabs>
        
        <FinancialParamsConfig register={register} errors={errors} />
        
        {activeSeason && !isCreating && (
          <JackpotCard activeSeason={activeSeason} />
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-poker-gold hover:bg-poker-gold/80 text-black font-bold">
            {isSubmitting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
