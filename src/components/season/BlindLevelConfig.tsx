
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlindLevel } from "@/lib/db/models";
import { Plus } from "lucide-react";
import { BlindLevelTable } from "./blind-levels/BlindLevelTable";
import { AddBreakDialog } from "./blind-levels/AddBreakDialog";
import { useBlindLevels } from "./blind-levels/useBlindLevels";

interface BlindLevelConfigProps {
  blindLevels: BlindLevel[];
  onChange: (blindLevels: BlindLevel[]) => void;
}

export function BlindLevelConfig({ blindLevels, onChange }: BlindLevelConfigProps) {
  const {
    isBreakDialogOpen,
    setIsBreakDialogOpen,
    addLevel,
    addBreak,
    updateLevel,
    removeLevel
  } = useBlindLevels(blindLevels, onChange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estrutura de Blinds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={addLevel} 
              className="flex items-center gap-1"
              type="button"
            >
              <Plus size={16} />
              Adicionar Nível
            </Button>
            <Button 
              onClick={() => setIsBreakDialogOpen(true)} 
              variant="outline" 
              className="flex items-center gap-1"
              type="button"
            >
              <Plus size={16} />
              Adicionar Intervalo
            </Button>
          </div>

          {blindLevels.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md">
              Nenhum nível configurado. Adicione níveis de blind para esta temporada.
            </div>
          )}

          {/* Tabela de níveis de blind */}
          {blindLevels.length > 0 && (
            <BlindLevelTable 
              blindLevels={blindLevels}
              updateLevel={updateLevel}
              removeLevel={removeLevel}
            />
          )}
        </div>
      </CardContent>

      {/* Diálogo para adicionar intervalo */}
      <AddBreakDialog
        open={isBreakDialogOpen}
        onOpenChange={setIsBreakDialogOpen}
        blindLevels={blindLevels}
        onAddBreak={addBreak}
      />
    </Card>
  );
}
