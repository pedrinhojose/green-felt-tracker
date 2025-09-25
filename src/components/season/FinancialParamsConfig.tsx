
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="clubFundContribution">Contribuição Caixinha (R$)</Label>
            <Input 
              id="clubFundContribution" 
              type="number" 
              min="0"
              step="0.01" 
              placeholder="2.00"
              {...register("clubFundContribution", { required: "Contribuição para Caixinha é obrigatória", valueAsNumber: true })}
            />
            {errors.clubFundContribution && <p className="text-destructive text-sm">{errors.clubFundContribution.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixKey">Chave PIX</Label>
          <Input 
            id="pixKey" 
            type="text" 
            maxLength={77}
            placeholder="Digite sua chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória)"
            {...register("pixKey")}
          />
          {errors.pixKey && <p className="text-destructive text-sm">{errors.pixKey.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
