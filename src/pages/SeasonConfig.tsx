
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoker } from "@/contexts/PokerContext";
import { formatDate } from "@/lib/utils/dateUtils";
import { pokerDB } from "@/lib/db";
import { BlindLevelConfig } from "@/components/season/BlindLevelConfig";
import { HostScheduleConfig } from "@/components/season/HostScheduleConfig";
import { SeasonBasicInfo } from "@/components/season/SeasonBasicInfo";
import { ScoreSchemaConfig } from "@/components/season/ScoreSchemaConfig";
import { PrizeSchemaConfig } from "@/components/season/PrizeSchemaConfig";
import { FinancialParamsConfig } from "@/components/season/FinancialParamsConfig";
import { HouseRulesConfig } from "@/components/season/HouseRulesConfig";
import { JackpotCard } from "@/components/season/JackpotCard";
import { EliminationRewardConfig } from "@/components/season/EliminationRewardConfig";
import { useSeasonForm } from "@/hooks/useSeasonForm";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
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
  const { activeSeason, seasons, createSeason, updateSeason } = usePoker();
  const [searchParams] = useSearchParams();
  const forceNew = searchParams.get('new') === '1';
  const [isCreating] = useState(forceNew || !activeSeason);
  const [inheritFromPrevious, setInheritFromPrevious] = useState(true);
  const [gamesCount, setGamesCount] = useState<number>(0);
  const [advancedUnlocked, setAdvancedUnlocked] = useState(false);

  const previousSeason = useMemo(() => {
    if (!seasons || seasons.length === 0) return null;
    const candidates = seasons.filter(s => !activeSeason || s.id !== activeSeason.id);
    if (candidates.length === 0) return null;
    const sorted = [...candidates].sort((a, b) => {
      const da = new Date(a.endDate ?? a.createdAt).getTime();
      const db = new Date(b.endDate ?? b.createdAt).getTime();
      return db - da;
    });
    return sorted[0];
  }, [seasons, activeSeason]);

  // Detectar partidas já jogadas para bloqueio de edição avançada
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isCreating || !activeSeason) {
        setGamesCount(0);
        return;
      }
      try {
        const games = await pokerDB.getGames(activeSeason.id);
        if (!cancelled) setGamesCount(games?.length || 0);
      } catch {
        if (!cancelled) setGamesCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, [activeSeason, isCreating]);

  const advancedLocked = !isCreating && gamesCount > 0 && !advancedUnlocked;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
    isSubmitting,
  } = useSeasonForm(activeSeason, isCreating, createSeason, updateSeason, previousSeason, inheritFromPrevious);

  const showInheritBanner = isCreating && !!previousSeason;

  // Banner de contexto: qual temporada está sendo editada
  const contextBanner = (() => {
    if (isCreating) {
      return {
        tone: "bg-emerald-500/10 border-emerald-500/40 text-emerald-100",
        title: "Nova Temporada (não salva ainda)",
        subtitle: "Preencha as configurações e clique em Salvar para criar.",
      };
    }
    if (!activeSeason) return null;
    const status = activeSeason.isActive ? "Ativa" : (activeSeason.endDate ? "Encerrada" : "Inativa");
    const range = `Início ${formatDate(activeSeason.startDate)}${activeSeason.endDate ? ` • Fim ${formatDate(activeSeason.endDate)}` : ""}`;
    return {
      tone: "bg-poker-gold/10 border-poker-gold/40 text-white",
      title: `Editando: ${activeSeason.name} — ${status}`,
      subtitle: range,
    };
  })();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isCreating ? 'Nova Temporada' : 'Configuração da Temporada'}
        </h2>
      </div>

      {contextBanner && (
        <div className={`mb-4 rounded-md border p-3 ${contextBanner.tone}`}>
          <div className="font-semibold">{contextBanner.title}</div>
          <div className="text-xs opacity-90">{contextBanner.subtitle}</div>
        </div>
      )}

      {showInheritBanner && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-poker-gold/40 bg-poker-gold/10 p-3 text-sm text-white">
          <span>
            {inheritFromPrevious
              ? <>Configurações herdadas da temporada anterior <strong>{previousSeason?.name}</strong>. Ajuste o que precisar.</>
              : <>Usando configurações padrão. Você pode recarregar as configurações da temporada anterior <strong>{previousSeason?.name}</strong>.</>}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInheritFromPrevious(prev => !prev)}
          >
            {inheritFromPrevious ? 'Limpar e usar padrões' : 'Herdar da anterior'}
          </Button>
        </div>
      )}

      {!isCreating && gamesCount > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-white">
          <div className="flex items-start gap-2">
            {advancedLocked ? <Lock className="h-4 w-4 mt-0.5" /> : <Unlock className="h-4 w-4 mt-0.5" />}
            <span>
              Esta temporada já tem <strong>{gamesCount}</strong> partida(s) registrada(s).
              {advancedLocked
                ? " Configurações estruturais (pontuação, prêmios, financeiro, eliminações) estão bloqueadas para preservar o histórico."
                : " Edição avançada desbloqueada — alterações não afetam partidas já jogadas, apenas as próximas."}
            </span>
          </div>
          {advancedLocked ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">Desbloquear edição avançada</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Desbloquear edição avançada
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Alterar pontuação, prêmios, parâmetros financeiros ou eliminações pode causar
                    inconsistências entre partidas já jogadas e as próximas. Prossiga apenas se souber
                    o que está fazendo. As partidas anteriores <strong>não</strong> serão recalculadas
                    automaticamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setAdvancedUnlocked(true)}>
                    Desbloquear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdvancedUnlocked(false)}>
              Bloquear novamente
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SeasonBasicInfo
          register={register}
          setValue={setValue}
          errors={errors}
          gameFrequency={watch('gameFrequency')}
        />


        <Tabs defaultValue="scores">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="scores">Pontuação</TabsTrigger>
            <TabsTrigger value="weekly">Prem. Semanal</TabsTrigger>
            <TabsTrigger value="season">Prem. Final</TabsTrigger>
            <TabsTrigger value="eliminations">Eliminações</TabsTrigger>
            <TabsTrigger value="blinds">Blinds</TabsTrigger>
            <TabsTrigger value="dinners">Jantares</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="scores">
            <fieldset disabled={advancedLocked} className={advancedLocked ? "opacity-60" : ""}>
              <ScoreSchemaConfig
                scoreEntries={scoreEntries}
                onChange={setScoreEntries}
              />
            </fieldset>
          </TabsContent>

          <TabsContent value="weekly">
            <fieldset disabled={advancedLocked} className={advancedLocked ? "opacity-60" : ""}>
              <PrizeSchemaConfig
                entries={weeklyPrizeEntries}
                onChange={setWeeklyPrizeEntries}
                title="Premiação Semanal"
              />
            </fieldset>
          </TabsContent>

          <TabsContent value="season">
            <fieldset disabled={advancedLocked} className={advancedLocked ? "opacity-60" : ""}>
              <PrizeSchemaConfig
                entries={seasonPrizeEntries}
                onChange={setSeasonPrizeEntries}
                title="Premiação Final da Temporada"
              />
            </fieldset>
          </TabsContent>

          <TabsContent value="eliminations">
            <fieldset disabled={advancedLocked} className={advancedLocked ? "opacity-60" : ""}>
              <EliminationRewardConfig
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </fieldset>
          </TabsContent>

          <TabsContent value="blinds">
            <BlindLevelConfig blindLevels={blindLevels} onChange={setBlindLevels} />
          </TabsContent>

          <TabsContent value="dinners">
            <HostScheduleConfig
              hostSchedule={hostSchedule}
              onChange={setHostSchedule}
              seasonDefaults={{
                startDate: watch('startDate'),
                expectedEndDate: watch('expectedEndDate'),
                gameFrequency: watch('gameFrequency'),
              }}
            />
          </TabsContent>

          <TabsContent value="rules">
            <HouseRulesConfig register={register} errors={errors} />
          </TabsContent>

          <TabsContent value="financial">
            <div className="space-y-6">
              <fieldset disabled={advancedLocked} className={advancedLocked ? "opacity-60" : ""}>
                <FinancialParamsConfig register={register} errors={errors} />
              </fieldset>

              {activeSeason && !isCreating && (
                <JackpotCard activeSeason={activeSeason} />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-poker-gold hover:bg-poker-gold/80 text-black font-bold">
            {isSubmitting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
