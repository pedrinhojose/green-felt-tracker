
import { useState } from "react";
import { BlindLevel } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { formatBlindValue, parseBlindValue, isValidBlindValue } from "@/lib/utils/blindUtils";

interface BlindLevelTableProps {
  blindLevels: BlindLevel[];
  updateLevel: (index: number, field: keyof BlindLevel, value: any) => void;
  removeLevel: (index: number) => void;
}

export function BlindLevelTable({ 
  blindLevels, 
  updateLevel, 
  removeLevel 
}: BlindLevelTableProps) {
  
  const handleBlindValueChange = (
    index: number, 
    field: 'smallBlind' | 'bigBlind' | 'ante', 
    inputValue: string
  ) => {
    const numericValue = parseBlindValue(inputValue);
    if (numericValue !== null) {
      updateLevel(index, field, numericValue);
    }
  };

  return (
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
                      type="text"
                      value={formatBlindValue(level.smallBlind)}
                      onChange={(e) => handleBlindValueChange(index, 'smallBlind', e.target.value)}
                      placeholder="ex: 1K ou 1000"
                      className="h-8 w-full"
                    />
                  </td>
                  <td className="py-3 pl-2">
                    <Input
                      type="text"
                      value={formatBlindValue(level.bigBlind)}
                      onChange={(e) => handleBlindValueChange(index, 'bigBlind', e.target.value)}
                      placeholder="ex: 2K ou 2000"
                      className="h-8 w-full"
                    />
                  </td>
                  <td className="py-3 pl-2">
                    <Input
                      type="text"
                      value={formatBlindValue(level.ante)}
                      onChange={(e) => handleBlindValueChange(index, 'ante', e.target.value)}
                      placeholder="ex: 500 ou 0.5K"
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
  );
}
