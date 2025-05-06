
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
  );
}
