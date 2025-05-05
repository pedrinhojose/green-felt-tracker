
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BlindLevel } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface BlindLevelConfigProps {
  blindLevels: BlindLevel[];
  onChange: (blindLevels: BlindLevel[]) => void;
}

export function BlindLevelConfig({ blindLevels, onChange }: BlindLevelConfigProps) {
  const addLevel = () => {
    const newLevel: BlindLevel = {
      id: uuidv4(),
      level: blindLevels.length + 1,
      smallBlind: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].smallBlind * 2 : 25,
      bigBlind: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].bigBlind * 2 : 50,
      ante: blindLevels.length > 0 ? blindLevels[blindLevels.length - 1].ante : 0,
      duration: 20,
      isBreak: false,
    };
    onChange([...blindLevels, newLevel]);
  };

  const addBreak = () => {
    const newBreak: BlindLevel = {
      id: uuidv4(),
      level: blindLevels.length + 1,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15,
      isBreak: true,
    };
    onChange([...blindLevels, newBreak]);
  };

  const updateLevel = (index: number, field: keyof BlindLevel, value: any) => {
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
            <Button onClick={addLevel} className="flex items-center gap-1">
              <Plus size={16} />
              Adicionar Nível
            </Button>
            <Button onClick={addBreak} variant="outline" className="flex items-center gap-1">
              <Plus size={16} />
              Adicionar Intervalo
            </Button>
          </div>

          {blindLevels.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-md">
              Nenhum nível configurado. Adicione níveis de blind para esta temporada.
            </div>
          )}

          <div className="space-y-4">
            {blindLevels.map((level, index) => (
              <div key={level.id} className={`p-4 rounded-lg border ${level.isBreak ? 'bg-muted/50 border-dashed' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">
                    {level.isBreak ? 'Intervalo' : `Nível ${level.level}`}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLevel(index)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {!level.isBreak && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`small-blind-${index}`}>Small Blind</Label>
                        <Input
                          id={`small-blind-${index}`}
                          type="number"
                          min="0"
                          value={level.smallBlind}
                          onChange={(e) => updateLevel(index, 'smallBlind', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`big-blind-${index}`}>Big Blind</Label>
                        <Input
                          id={`big-blind-${index}`}
                          type="number"
                          min="0"
                          value={level.bigBlind}
                          onChange={(e) => updateLevel(index, 'bigBlind', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ante-${index}`}>Ante</Label>
                        <Input
                          id={`ante-${index}`}
                          type="number"
                          min="0"
                          value={level.ante}
                          onChange={(e) => updateLevel(index, 'ante', Number(e.target.value))}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${index}`}>Duração (minutos)</Label>
                    <Input
                      id={`duration-${index}`}
                      type="number"
                      min="1"
                      value={level.duration}
                      onChange={(e) => updateLevel(index, 'duration', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
