
import { useToast } from "@/components/ui/use-toast";
import { Season } from "@/lib/db/models";
import { SeasonFormValues, ScoreEntry, PrizeEntry } from "@/types/season";
import { v4 as uuidv4 } from "uuid";

export function useSeasonFormSubmitter(
  activeSeason: Season | null,
  isCreating: boolean,
  createSeason: (seasonData: Partial<Season>) => Promise<string>,
  updateSeason: (seasonData: Partial<Season>) => Promise<void>,
  scoreEntries: ScoreEntry[],
  weeklyPrizeEntries: PrizeEntry[],
  seasonPrizeEntries: PrizeEntry[],
  blindLevels: any[],
  hostSchedule?: any[]
) {
  const { toast } = useToast();
  
  const validateAndSubmitForm = async (data: SeasonFormValues, setIsSubmitting: (value: boolean) => void) => {
    try {
      setIsSubmitting(true);
      
      console.log("Submitting form with blind levels:", blindLevels);
      
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
      
      // Ensure all blind levels have an ID
      const validatedBlindLevels = blindLevels.map(level => {
        if (!level.id) {
          return { ...level, id: uuidv4() };
        }
        return level;
      });
      
      const seasonData = {
        name: data.name,
        startDate: new Date(data.startDate),
        gameFrequency: data.gameFrequency,
        gamesPerPeriod: Number(data.gamesPerPeriod),
        scoreSchema: scoreEntries,
        weeklyPrizeSchema: weeklyPrizeEntries,
        seasonPrizeSchema: seasonPrizeEntries,
        blindStructure: validatedBlindLevels,
        houseRules: data.houseRules || '',
        financialParams: {
          buyIn: Number(data.buyIn),
          rebuy: Number(data.rebuy),
          addon: Number(data.addon),
          jackpotContribution: Number(data.jackpotContribution),
          clubFundContribution: Number(data.clubFundContribution),
          pixKey: data.pixKey || undefined,
        },
        hostSchedule: hostSchedule || [],
        eliminationRewardConfig: {
          enabled: data.eliminationRewardEnabled ?? false,
          rewardType: data.eliminationRewardType ?? 'points',
          rewardValue: Number(data.eliminationRewardValue) || 1,
          frequency: Math.max(1, Number(data.eliminationRewardFrequency) || 1),
          maxRewardsPerGame: Number(data.eliminationRewardMaxPerGame) || 0,
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

      return true;
    } catch (error) {
      console.error("Error saving season:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a temporada.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return validateAndSubmitForm;
}
