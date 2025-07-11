
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { SeasonFormValues } from "@/types/season";

interface HouseRulesConfigProps {
  register: UseFormRegister<SeasonFormValues>;
  errors: FieldErrors<SeasonFormValues>;
}

export function HouseRulesConfig({ register, errors }: HouseRulesConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras da Casa</CardTitle>
        <CardDescription>
          Digite aqui as normas e regras do seu clube de poker. Este texto será exibido para todos os jogadores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            {...register('houseRules')}
            placeholder="Digite as regras da casa aqui...

Exemplo:
• Respeito mútuo entre todos os jogadores
• É proibido o uso de celular durante as mãos
• Apostas verbais são válidas
• Não é permitido discutir mãos enquanto outros jogadores ainda estão na rodada
• Tolerância zero com trapaças
• Horário de chegada: até 19h30
• Política de recompra: máximo 2 recompras por jogador"
            className="min-h-[300px] resize-none text-sm"
          />
          {errors.houseRules && (
            <p className="text-sm text-red-500 mt-1">{errors.houseRules.message}</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>💡 Dica: Use quebras de linha e bullets (•) para organizar melhor as regras.</p>
        </div>
      </CardContent>
    </Card>
  );
}
