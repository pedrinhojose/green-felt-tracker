
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, FormState, UseFormSetValue } from "react-hook-form";
import { SeasonFormValues } from "@/types/season";

interface SeasonBasicInfoProps {
  register: UseFormRegister<SeasonFormValues>;
  setValue: UseFormSetValue<SeasonFormValues>;
  errors: FormState<SeasonFormValues>["errors"];
  gameFrequency?: string;
}

export function SeasonBasicInfo({ register, setValue, errors, gameFrequency }: SeasonBasicInfoProps) {
  return (
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
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gameFrequency">Frequência das Partidas</Label>
            <Select onValueChange={(value) => setValue("gameFrequency", value as any)} defaultValue={gameFrequency || "weekly"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quinzenal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
            {errors.gameFrequency && <p className="text-red-500 text-sm">{errors.gameFrequency.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gamesPerPeriod">Partidas por Período</Label>
            <Input 
              id="gamesPerPeriod" 
              type="number" 
              min="1" 
              placeholder="Ex: 2 (para 2 partidas por semana)"
              {...register("gamesPerPeriod", { 
                required: "Número de partidas é obrigatório",
                min: { value: 1, message: "Deve ser pelo menos 1" } 
              })}
            />
            {errors.gamesPerPeriod && <p className="text-red-500 text-sm">{errors.gamesPerPeriod.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
