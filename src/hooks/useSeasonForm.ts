
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Season, BlindLevel } from "@/lib/db/models";
import { SeasonFormValues, ScoreEntry, PrizeEntry } from "@/types/season";
import { v4 as uuidv4 } from "uuid";

export function useSeasonForm(
  activeSeason: Season | null,
  isCreating: boolean,
  createSeason: (seasonData: Partial<Season>) => Promise<string>,
  updateSeason: (seasonData: Partial<Season>) => Promise<void>
) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [weeklyPrizeEntries, setWeeklyPrizeEntries] = useState<PrizeEntry[]>([]);
  const [seasonPrizeEntries, setSeasonPrizeEntries] = useState<PrizeEntry[]>([]);
  const [blindLevels, setBlindLevels] = useState<BlindLevel[]>([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SeasonFormValues>();

  // Initialize form when component loads
  useEffect(() => {
    if (activeSeason && !isCreating) {
      setValue('name', activeSeason.name);
      setValue('startDate', new Date(activeSeason.startDate).toISOString().split('T')[0]);
      setValue('gamesPerWeek', activeSeason.gamesPerWeek);
      setValue('buyIn', activeSeason.financialParams.buyIn);
      setValue('rebuy', activeSeason.financialParams.rebuy);
      setValue('addon', activeSeason.financialParams.addon);
      setValue('jackpotContribution', activeSeason.financialParams.jackpotContribution);
      
      setScoreEntries([...activeSeason.scoreSchema]);
      setWeeklyPrizeEntries([...activeSeason.weeklyPrizeSchema]);
      setSeasonPrizeEntries([...activeSeason.seasonPrizeSchema]);
      setBlindLevels(activeSeason.blindStructure || []);
    } else {
      // Default values for new season
      const today = new Date().toISOString().split('T')[0];
      setValue('startDate', today);
      setValue('gamesPerWeek', 1);
      setValue('buyIn', 15);
      setValue('rebuy', 15);
      setValue('addon', 15);
      setValue('jackpotContribution', 5);
      
      // Updated default score schema matching the image (6 positions)
      setScoreEntries([
        { position: 1, points: 10 },
        { position: 2, points: 7 },
        { position: 3, points: 5 },
        { position: 4, points: 3 },
        { position: 5, points: 2 },
        { position: 6, points: 1 }
      ]);
      
      setWeeklyPrizeEntries([
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ]);
      
      setSeasonPrizeEntries([
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 }
      ]);
      
      // Default blind structure
      setBlindLevels([
        {
          id: uuidv4(),
          level: 1,
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,
          duration: 20,
          isBreak: false
        },
        {
          id: uuidv4(),
          level: 2,
          smallBlind: 50,
          bigBlind: 100,
          ante: 0,
          duration: 20,
          isBreak: false
        }
      ]);
    }
  }, [activeSeason, isCreating, setValue]);

  const onSubmit = async (data: SeasonFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate total percentages
      const totalWeeklyPercentage = weeklyPrizeEntries.reduce((sum, entry) => sum + entry.percentage, 0);
      const totalSeasonPercentage = seasonPrizeEntries.reduce((sum, entry) => sum + entry.percentage, 0);
      
      if (totalWeeklyPercentage !== 100) {
        toast({
          title: "Erro de validação",
          description: "Os percentuais de premiação semanal devem somar 100%.",
          variant: "destructive",
        });
        return;
      }
      
      if (totalSeasonPercentage !== 100) {
        toast({
          title: "Erro de validação",
          description: "Os percentuais de premiação final devem somar 100%.",
          variant: "destructive",
        });
        return;
      }
      
      if (blindLevels.length === 0) {
        toast({
          title: "Erro de validação",
          description: "É necessário configurar pelo menos um nível de blind.",
          variant: "destructive",
        });
        return;
      }
      
      const seasonData = {
        name: data.name,
        startDate: new Date(data.startDate),
        gamesPerWeek: Number(data.gamesPerWeek),
        scoreSchema: scoreEntries,
        weeklyPrizeSchema: weeklyPrizeEntries,
        seasonPrizeSchema: seasonPrizeEntries,
        blindStructure: blindLevels,
        financialParams: {
          buyIn: Number(data.buyIn),
          rebuy: Number(data.rebuy),
          addon: Number(data.addon),
          jackpotContribution: Number(data.jackpotContribution)
        }
      };
      
      if (isCreating) {
        await createSeason(seasonData);
        toast({
          title: "Temporada criada",
          description: "Nova temporada criada com sucesso.",
        });
      } else if (activeSeason) {
        await updateSeason({
          id: activeSeason.id,
          ...seasonData
        });
        toast({
          title: "Temporada atualizada",
          description: "As configurações da temporada foram atualizadas.",
        });
      }
    } catch (error) {
      console.error("Error saving season:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a temporada.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    onSubmit,
    isSubmitting
  };
}
