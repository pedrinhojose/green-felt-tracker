
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FormState } from "react-hook-form";
import { SeasonFormValues } from "@/types/season";

interface SeasonBasicInfoProps {
  register: UseFormRegister<SeasonFormValues>;
  errors: FormState<SeasonFormValues>["errors"];
}

export function SeasonBasicInfo({ register, errors }: SeasonBasicInfoProps) {
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
  );
}
