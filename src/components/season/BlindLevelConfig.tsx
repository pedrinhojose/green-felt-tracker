
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BlindLevel } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlindLevelConfigProps {
  blindLevels: BlindLevel[];
  onChange: (blindLevels: BlindLevel[]) => void;
}

export function BlindLevelConfig({ blindLevels, onChange }: BlindLevelConfigProps) {
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [breakAfterLevel, setBreakAfterLevel] = useState<string>("1");
  const [breakDuration, setBreakDuration] = useState<number>(15);

  const addLevel = () => {
    // Ensure we have a valid ID and level number
    const newLevel: BlindLevel = {
      id: uuidv4(),
      level: blindLevels.length + 1,
      smallBlind: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].smallBlind * 2 : 25,
      bigBlind: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].bigBlind * 2 : 50,
      ante: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].ante : 0,
      duration: 20,
      isBreak: false,
    };
    
    console.log("Adding new blind level:", newLevel);
    
    // Create a new array to ensure React detects the change
    const updatedLevels = [...blindLevels, newLevel];
    onChange(updatedLevels);
  };

  const addBreak = () => {
    const selectedLevelIndex = parseInt(breakAfterLevel);
    
    if (isNaN(selectedLevelIndex)) {
      console.error("Invalid level index for break");
      return;
    }
    
    // Create the new break
    const newBreak: BlindLevel = {
      id: uuidv4(),
      level: selectedLevelIndex + 1,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: breakDuration,
      isBreak: true,
    };
    
    // Get the levels before and after the selected index
    const levelsBeforeBreak = blindLevels.slice(0, selectedLevelIndex);
    const levelsAfterBreak = blindLevels.slice(selectedLevelIndex);
    
    // Insert the break and update subsequent level numbers
    const updatedLevelsAfterBreak = levelsAfterBreak.map(level => ({
      ...level,
      level: level.level + 1
    }));
    
    // Combine all levels with the break inserted
    const updatedLevels = [
      ...levelsBeforeBreak,
      newBreak,
      ...updatedLevelsAfterBreak
    ];
    
    onChange(updatedLevels);
    setIsBreakDialogOpen(false);
  };

  const updateLevel = (index: number, field: keyof BlindLevel, value: any) => {
    if (index < 0 || index >= blindLevels.length) {
      console.error("Invalid index for updating blind level:", index);
      return;
    }
    
    const updatedLevels = [...blindLevels];
    updatedLevels[index] = { ...updatedLevels[index], [field]: value };
    onChange(updatedLevels);
  };

  const removeLevel = (index: number) => {
    const updatedLevels = blindLevels.filter((_, i) => i !== index);
    // Update level numbers after removal
    const reorderedLevels = updatedLevels.map((level, idx) => ({
      ...level,
      level: idx + 1
    }));
    onChange(reorderedLevels);
  };

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-poker-dark-green bg-poker-navy/20">
                  <th className="text-left py-2 pl-3 w-20">Nível</th>
                  <th className="text-left py-2 pl-2 w-28">Small Blind</th>
                  <th className="text-left py-2 pl-2 w-28">Big Blind</th>
                  <th className="text-left py-2 pl-2 w-28">Ante</th>
                  <th className="text-left py-2 pl-2 w-28">Duração (min)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {blindLevels.map((level, index) => (
                  <tr 
                    key={level.id} 
                    className={`border-b ${level.isBreak ? 'bg-muted/30' : ''}`}
                  >
                    <td className="py-3 pl-3 font-medium">
                      {level.isBreak ? `Intervalo ${level.level}` : `Nível ${level.level}`}
                    </td>
                    
                    {level.isBreak ? (
                      <td className="py-3 pl-2" colSpan={3}>
                        Pausa para descanso
                      </td>
                    ) : (
                      <>
                        <td className="py-3 pl-2">
                          <Input
                            type="number"
                            min="0"
                            value={level.smallBlind}
                            onChange={(e) => updateLevel(index, 'smallBlind', Number(e.target.value))}
                            className="h-8 w-full"
                          />
                        </td>
                        <td className="py-3 pl-2">
                          <Input
                            type="number"
                            min="0"
                            value={level.bigBlind}
                            onChange={(e) => updateLevel(index, 'bigBlind', Number(e.target.value))}
                            className="h-8 w-full"
                          />
                        </td>
                        <td className="py-3 pl-2">
                          <Input
                            type="number"
                            min="0"
                            value={level.ante}
                            onChange={(e) => updateLevel(index, 'ante', Number(e.target.value))}
                            className="h-8 w-full"
                          />
                        </td>
                      </>
                    )}
                    
                    <td className="py-3 pl-2">
                      <Input
                        type="number"
                        min="1"
                        value={level.duration}
                        onChange={(e) => updateLevel(index, 'duration', Number(e.target.value))}
                        className="h-8 w-full"
                      />
                    </td>
                    
                    <td className="py-3 pl-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Diálogo para adicionar intervalo */}
      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Intervalo</DialogTitle>
            <DialogDescription>
              Configure o intervalo a ser adicionado na estrutura de blinds.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="level-select" className="text-sm font-medium">
                Adicionar intervalo após o nível:
              </label>
              <Select
                value={breakAfterLevel}
                onValueChange={setBreakAfterLevel}
              >
                <SelectTrigger id="level-select">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {blindLevels.filter(level => !level.isBreak).map((level, index) => (
                    <SelectItem key={level.id} value={String(index)}>
                      Nível {level.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="break-duration" className="text-sm font-medium">
                Duração do intervalo (minutos):
              </label>
              <Input
                id="break-duration"
                type="number"
                min="1"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBreakDialogOpen(false)} type="button">
              Cancelar
            </Button>
            <Button onClick={addBreak} type="button">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
