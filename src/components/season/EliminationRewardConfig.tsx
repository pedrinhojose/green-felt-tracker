import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { SeasonFormValues } from "@/types/season";
import { Swords, Trophy, DollarSign, Info } from "lucide-react";

interface EliminationRewardConfigProps {
  register: UseFormRegister<SeasonFormValues>;
  setValue: UseFormSetValue<SeasonFormValues>;
  watch: UseFormWatch<SeasonFormValues>;
}

export function EliminationRewardConfig({ register, setValue, watch }: EliminationRewardConfigProps) {
  const enabled = watch('eliminationRewardEnabled') ?? false;
  const rewardType = watch('eliminationRewardType') ?? 'points';
  const rewardValue = watch('eliminationRewardValue') ?? 1;
  const frequency = watch('eliminationRewardFrequency') ?? 1;
  const maxPerGame = watch('eliminationRewardMaxPerGame') ?? 0;

  // Calcula exemplo dinâmico
  const exampleEliminations = 5;
  const exampleRewards = maxPerGame > 0 
    ? Math.min(Math.floor(exampleEliminations / frequency), maxPerGame)
    : Math.floor(exampleEliminations / frequency);
  const exampleBonus = exampleRewards * rewardValue;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Recompensas por Eliminação
        </CardTitle>
        <CardDescription>
          Configure recompensas para jogadores que eliminam adversários durante a partida
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle para ativar/desativar */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="elimination-reward-toggle" className="text-base font-medium">
              Ativar recompensas por eliminação
            </Label>
            <p className="text-sm text-muted-foreground">
              Jogadores recebem bônus ao eliminar adversários
            </p>
          </div>
          <Switch
            id="elimination-reward-toggle"
            checked={enabled}
            onCheckedChange={(checked) => setValue('eliminationRewardEnabled', checked)}
          />
        </div>

        {enabled && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Tipo de Recompensa */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Recompensa</Label>
              <RadioGroup
                value={rewardType}
                onValueChange={(value: 'points' | 'money') => setValue('eliminationRewardType', value)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="points" id="reward-points" />
                  <Label htmlFor="reward-points" className="flex items-center gap-2 cursor-pointer">
                    <Trophy className="h-4 w-4 text-primary" />
                    Pontos no Ranking
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="money" id="reward-money" />
                  <Label htmlFor="reward-money" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Valor em Dinheiro
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Valor da Recompensa */}
            <div className="space-y-2">
              <Label htmlFor="reward-value" className="text-base font-medium">
                Valor da Recompensa
              </Label>
              <div className="flex items-center gap-2">
                {rewardType === 'money' && <span className="text-muted-foreground">R$</span>}
                <Input
                  id="reward-value"
                  type="number"
                  min={0}
                  step={rewardType === 'money' ? 0.5 : 1}
                  {...register('eliminationRewardValue', { valueAsNumber: true })}
                  className="w-32"
                />
                <span className="text-muted-foreground">
                  {rewardType === 'points' ? 'ponto(s)' : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {rewardType === 'points' 
                  ? 'Pontos adicionais no ranking por cada recompensa conquistada'
                  : 'Valor em reais adicionado ao prêmio por cada recompensa conquistada'
                }
              </p>
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label htmlFor="reward-frequency" className="text-base font-medium">
                Frequência (a cada quantas eliminações)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">A cada</span>
                <Input
                  id="reward-frequency"
                  type="number"
                  min={1}
                  {...register('eliminationRewardFrequency', { valueAsNumber: true, min: 1 })}
                  className="w-20"
                />
                <span className="text-muted-foreground">eliminação(ões)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Defina após quantas eliminações o jogador ganha uma recompensa
              </p>
            </div>

            {/* Limite Máximo */}
            <div className="space-y-2">
              <Label htmlFor="reward-max" className="text-base font-medium">
                Limite máximo de recompensas por partida
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="reward-max"
                  type="number"
                  min={0}
                  {...register('eliminationRewardMaxPerGame', { valueAsNumber: true })}
                  className="w-20"
                />
                <span className="text-muted-foreground">recompensa(s)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                0 = sem limite. Define o número máximo de recompensas que um jogador pode receber por partida.
              </p>
            </div>

            {/* Card de Exemplo */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-primary">Exemplo de Cálculo</p>
                  <div className="text-sm text-foreground space-y-1">
                    <p>• Frequência: <strong>{frequency}</strong> eliminação(ões)</p>
                    <p>• Valor: <strong>{rewardType === 'money' ? `R$ ${rewardValue.toFixed(2)}` : `${rewardValue} ponto(s)`}</strong></p>
                    {maxPerGame > 0 && <p>• Limite: <strong>{maxPerGame}</strong> recompensa(s) por partida</p>}
                    <div className="mt-3 pt-3 border-t border-primary/20">
                      <p>Se um jogador eliminar <strong>{exampleEliminations}</strong> adversários:</p>
                      <p className="text-primary font-medium mt-1">
                        → Ganha <strong>{exampleRewards}</strong> recompensa(s) = 
                        <strong> {rewardType === 'money' ? `R$ ${exampleBonus.toFixed(2)}` : `+${exampleBonus} ponto(s)`}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
