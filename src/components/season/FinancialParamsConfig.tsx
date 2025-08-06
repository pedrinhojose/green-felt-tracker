
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FormState } from "react-hook-form";
import { SeasonFormValues } from "@/types/season";

interface FinancialParamsConfigProps {
  register: UseFormRegister<SeasonFormValues>;
  errors: FormState<SeasonFormValues>["errors"];
}

export function FinancialParamsConfig({ register, errors }: FinancialParamsConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="buyIn">Buy-in (R$)</Label>
            <Input 
              id="buyIn" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="15.00"
              {...register("buyIn", { required: "Buy-in é obrigatório", valueAsNumber: true })}
            />
            {errors.buyIn && <p className="text-destructive text-sm">{errors.buyIn.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rebuy">Rebuy (R$)</Label>
            <Input 
              id="rebuy" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="15.00"
              {...register("rebuy", { required: "Rebuy é obrigatório", valueAsNumber: true })}
            />
            {errors.rebuy && <p className="text-destructive text-sm">{errors.rebuy.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addon">Add-on (R$)</Label>
            <Input 
              id="addon" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="15.00"
              {...register("addon", { required: "Add-on é obrigatório", valueAsNumber: true })}
            />
            {errors.addon && <p className="text-destructive text-sm">{errors.addon.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jackpotContribution">Contribuição Jackpot (R$)</Label>
            <Input 
              id="jackpotContribution" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="5.00"
              {...register("jackpotContribution", { required: "Contribuição para Jackpot é obrigatória", valueAsNumber: true })}
            />
            {errors.jackpotContribution && <p className="text-destructive text-sm">{errors.jackpotContribution.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clubMembershipValue">Valor da Mensalidade (R$)</Label>
            <Input 
              id="clubMembershipValue" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="0.00"
              {...register("clubMembershipValue", { valueAsNumber: true })}
            />
            {errors.clubMembershipValue && <p className="text-destructive text-sm">{errors.clubMembershipValue.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clubMembershipFrequency">Frequência</Label>
            <select
              id="clubMembershipFrequency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("clubMembershipFrequency")}
            >
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
            </select>
            {errors.clubMembershipFrequency && <p className="text-destructive text-sm">{errors.clubMembershipFrequency.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
