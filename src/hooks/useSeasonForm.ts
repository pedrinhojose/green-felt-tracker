
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Season, BlindLevel } from "@/lib/db/models";
import { SeasonFormValues, ScoreEntry, PrizeEntry } from "@/types/season";
import { useSeasonFormInitializer } from "./season/useSeasonFormInitializer";
import { useSeasonFormSubmitter } from "./season/useSeasonFormSubmitter";

export function useSeasonForm(
  activeSeason: Season | null,
  isCreating: boolean,
  createSeason: (seasonData: Partial<Season>) => Promise<string>,
  updateSeason: (seasonData: Partial<Season>) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [weeklyPrizeEntries, setWeeklyPrizeEntries] = useState<PrizeEntry[]>([]);
  const [seasonPrizeEntries, setSeasonPrizeEntries] = useState<PrizeEntry[]>([]);
  const [blindLevels, setBlindLevels] = useState<BlindLevel[]>([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SeasonFormValues>();

  // Initialize form values
  useSeasonFormInitializer(
    activeSeason, 
    isCreating, 
    setValue, 
    setScoreEntries, 
    setWeeklyPrizeEntries, 
    setSeasonPrizeEntries, 
    setBlindLevels
  );

  // Form submission handler
  const validateAndSubmitForm = useSeasonFormSubmitter(
    activeSeason,
    isCreating,
    createSeason,
    updateSeason,
    scoreEntries,
    weeklyPrizeEntries,
    seasonPrizeEntries,
    blindLevels
  );

  const onSubmit = async (data: SeasonFormValues) => {
    await validateAndSubmitForm(data, setIsSubmitting);
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
