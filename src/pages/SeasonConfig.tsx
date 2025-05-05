import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { usePoker } from "@/contexts/PokerContext";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { BlindLevelConfig } from "@/components/season/BlindLevelConfig";
import { v4 as uuidv4 } from "uuid";
import { BlindLevel } from "@/lib/db/models";
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

type FormValues = {
  name: string;
  startDate: string;
  gamesPerWeek: number;
  buyIn: number;
  rebuy: number;
  addon: number;
  ante: number;
  jackpotContribution: number;
};

export default function SeasonConfig() {
  const { toast } = useToast();
  const { activeSeason, createSeason, updateSeason, endSeason } = usePoker();
  const [isCreating, setIsCreating] = useState(!activeSeason);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreEntries, setScoreEntries] = useState<{ position: number; points: number }[]>([]);
  const [weeklyPrizeEntries, setWeeklyPrizeEntries] = useState<{ position: number; percentage: number }[]>([]);
  const [seasonPrizeEntries, setSeasonPrizeEntries] = useState<{ position: number; percentage: number }[]>([]);
  const [blindLevels, setBlindLevels] = useState<BlindLevel[]>([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();

  // Initialize form when component loads
  useEffect(() => {
    if (activeSeason && !isCreating) {
      setValue('name', activeSeason.name);
      setValue('startDate', new Date(activeSeason.startDate).toISOString().split('T')[0]);
      setValue('gamesPerWeek', activeSeason.gamesPerWeek);
      setValue('buyIn', activeSeason.financialParams.buyIn);
      setValue('rebuy', activeSeason.financialParams.rebuy);
      setValue('addon', activeSeason.financialParams.addon);
      setValue('ante', activeSeason.financialParams.ante);
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
      setValue('buyIn', 30);
      setValue('rebuy', 30);
      setValue('addon', 30);
      setValue('ante', 5);
      setValue('jackpotContribution', 5);
      
      setScoreEntries([
        { position: 1, points: 10 },
        { position: 2, points: 7 },
        { position: 3, points: 5 },
        { position: 4, points: 3 },
        { position: 5, points: 1 }
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

  const onSubmit = async (data: FormValues) => {
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
          ante: Number(data.ante),
          jackpotContribution: Number(data.jackpotContribution)
        }
      };
      
      if (isCreating) {
        await createSeason(seasonData);
        toast({
          title: "Temporada criada",
          description: "Nova temporada criada com sucesso.",
        });
        setIsCreating(false);
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

  const handleEndSeason = async () => {
    if (!activeSeason) return;
    
    try {
      setIsSubmitting(true);
      await endSeason(activeSeason.id);
      setIsCreating(true);
    } catch (error) {
      console.error("Error ending season:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a temporada.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table management functions
  const updateScoreEntry = (index: number, field: 'position' | 'points', value: number) => {
    const newEntries = [...scoreEntries];
    newEntries[index][field] = value;
    setScoreEntries(newEntries);
  };

  const addScoreEntry = () => {
    const newPosition = scoreEntries.length > 0 
      ? Math.max(...scoreEntries.map(e => e.position)) + 1 
      : 1;
    setScoreEntries([...scoreEntries, { position: newPosition, points: 0 }]);
  };

  const removeScoreEntry = (index: number) => {
    setScoreEntries(scoreEntries.filter((_, i) => i !== index));
  };

  const updateWeeklyPrizeEntry = (index: number, field: 'position' | 'percentage', value: number) => {
    const newEntries = [...weeklyPrizeEntries];
    newEntries[index][field] = value;
    setWeeklyPrizeEntries(newEntries);
  };

  const addWeeklyPrizeEntry = () => {
    const newPosition = weeklyPrizeEntries.length > 0 
      ? Math.max(...weeklyPrizeEntries.map(e => e.position)) + 1 
      : 1;
    setWeeklyPrizeEntries([...weeklyPrizeEntries, { position: newPosition, percentage: 0 }]);
  };

  const removeWeeklyPrizeEntry = (index: number) => {
    setWeeklyPrizeEntries(weeklyPrizeEntries.filter((_, i) => i !== index));
  };

  const updateSeasonPrizeEntry = (index: number, field: 'position' | 'percentage', value: number) => {
    const newEntries = [...seasonPrizeEntries];
    newEntries[index][field] = value;
    setSeasonPrizeEntries(newEntries);
  };

  const addSeasonPrizeEntry = () => {
    const newPosition = seasonPrizeEntries.length > 0 
      ? Math.max(...seasonPrizeEntries.map(e => e.position)) + 1 
      : 1;
    setSeasonPrizeEntries([...seasonPrizeEntries, { position: newPosition, percentage: 0 }]);
  };

  const removeSeasonPrizeEntry = (index: number) => {
    setSeasonPrizeEntries(seasonPrizeEntries.filter((_, i) => i !== index));
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
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Temporada</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Temporada 1/2023"
                  {...register("name", { required: "Nome é obrigatório" })}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  {...register("startDate", { required: "Data de início é obrigatória" })}
                />
                {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="gamesPerWeek">Partidas por Semana</Label>
              <Input 
                id="gamesPerWeek" 
                type="number" 
                min="1" 
                {...register("gamesPerWeek", { 
                  required: "Número de partidas é obrigatório",
                  min: { value: 1, message: "Deve ser pelo menos 1" } 
                })}
              />
              {errors.gamesPerWeek && <p className="text-red-500 text-sm">{errors.gamesPerWeek.message}</p>}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="scores">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scores">Pontuação</TabsTrigger>
            <TabsTrigger value="weekly">Premiação Semanal</TabsTrigger>
            <TabsTrigger value="season">Premiação Final</TabsTrigger>
            <TabsTrigger value="blinds">Estrutura de Blinds</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>Esquema de Pontuação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-poker-dark-green">
                        <th className="text-left p-2">Posição</th>
                        <th className="text-left p-2">Pontos</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreEntries.map((entry, index) => (
                        <tr key={index} className="border-b border-poker-dark-green">
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="1" 
                              value={entry.position}
                              onChange={(e) => updateScoreEntry(index, 'position', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="0" 
                              value={entry.points}
                              onChange={(e) => updateScoreEntry(index, 'points', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeScoreEntry(index)}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" onClick={addScoreEntry} className="mt-4">
                  Adicionar Posição
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Premiação Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-poker-dark-green">
                        <th className="text-left p-2">Posição</th>
                        <th className="text-left p-2">Porcentagem (%)</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyPrizeEntries.map((entry, index) => (
                        <tr key={index} className="border-b border-poker-dark-green">
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="1" 
                              value={entry.position}
                              onChange={(e) => updateWeeklyPrizeEntry(index, 'position', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={entry.percentage}
                              onChange={(e) => updateWeeklyPrizeEntry(index, 'percentage', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeWeeklyPrizeEntry(index)}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="p-2 font-semibold">Total:</td>
                        <td className="p-2 font-semibold">
                          {weeklyPrizeEntries.reduce((sum, entry) => sum + entry.percentage, 0)}%
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Button type="button" onClick={addWeeklyPrizeEntry} className="mt-4">
                  Adicionar Posição
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="season">
            <Card>
              <CardHeader>
                <CardTitle>Premiação Final da Temporada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-poker-dark-green">
                        <th className="text-left p-2">Posição</th>
                        <th className="text-left p-2">Porcentagem (%)</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonPrizeEntries.map((entry, index) => (
                        <tr key={index} className="border-b border-poker-dark-green">
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="1" 
                              value={entry.position}
                              onChange={(e) => updateSeasonPrizeEntry(index, 'position', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={entry.percentage}
                              onChange={(e) => updateSeasonPrizeEntry(index, 'percentage', parseInt(e.target.value))}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeSeasonPrizeEntry(index)}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="p-2 font-semibold">Total:</td>
                        <td className="p-2 font-semibold">
                          {seasonPrizeEntries.reduce((sum, entry) => sum + entry.percentage, 0)}%
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Button type="button" onClick={addSeasonPrizeEntry} className="mt-4">
                  Adicionar Posição
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="blinds">
            <BlindLevelConfig blindLevels={blindLevels} onChange={setBlindLevels} />
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="buyIn">Buy-in (R$)</Label>
                <Input 
                  id="buyIn" 
                  type="number" 
                  min="0"
                  step="any" 
                  {...register("buyIn", { required: "Buy-in é obrigatório" })}
                />
                {errors.buyIn && <p className="text-red-500 text-sm">{errors.buyIn.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rebuy">Rebuy (R$)</Label>
                <Input 
                  id="rebuy" 
                  type="number" 
                  min="0"
                  step="any" 
                  {...register("rebuy", { required: "Rebuy é obrigatório" })}
                />
                {errors.rebuy && <p className="text-red-500 text-sm">{errors.rebuy.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addon">Add-on (R$)</Label>
                <Input 
                  id="addon" 
                  type="number" 
                  min="0"
                  step="any" 
                  {...register("addon", { required: "Add-on é obrigatório" })}
                />
                {errors.addon && <p className="text-red-500 text-sm">{errors.addon.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ante">Ante (R$)</Label>
                <Input 
                  id="ante" 
                  type="number" 
                  min="0"
                  step="any" 
                  {...register("ante", { required: "Ante é obrigatório" })}
                />
                {errors.ante && <p className="text-red-500 text-sm">{errors.ante.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jackpotContribution">Contribuição Jackpot (R$)</Label>
                <Input 
                  id="jackpotContribution" 
                  type="number" 
                  min="0"
                  step="any" 
                  {...register("jackpotContribution", { required: "Contribuição para Jackpot é obrigatória" })}
                />
                {errors.jackpotContribution && <p className="text-red-500 text-sm">{errors.jackpotContribution.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {activeSeason && !isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Jackpot Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-poker-gold mb-2">
                  {formatCurrency(activeSeason.jackpot)}
                </div>
                <p className="text-muted-foreground">
                  O jackpot será distribuído ao encerrar a temporada conforme a configuração de premiação final.
                </p>
              </div>
            </CardContent>
          </Card>
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
