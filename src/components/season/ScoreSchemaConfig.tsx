
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreEntry } from "@/types/season";

interface ScoreSchemaConfigProps {
  scoreEntries: ScoreEntry[];
  onChange: (entries: ScoreEntry[]) => void;
}

export function ScoreSchemaConfig({ scoreEntries, onChange }: ScoreSchemaConfigProps) {
  const updateScoreEntry = (index: number, field: 'position' | 'points', value: number) => {
    const newEntries = [...scoreEntries];
    newEntries[index][field] = value;
    onChange(newEntries);
  };

  const addScoreEntry = () => {
    const newPosition = scoreEntries.length > 0 
      ? Math.max(...scoreEntries.map(e => e.position)) + 1 
      : 1;
    onChange([...scoreEntries, { position: newPosition, points: 0 }]);
  };

  const removeScoreEntry = (index: number) => {
    onChange(scoreEntries.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Esquema de Pontuação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-poker-dark-green">
                <th className="text-left p-2">Posição</th>
                <th className="text-left p-2">Pontos</th>
                <th className="text-right p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {scoreEntries.map((entry, index) => (
                <tr key={index} className="border-b border-poker-dark-green">
                  <td className="p-2">
                    <Input 
                      type="number" 
                      min="1" 
                      value={entry.position}
                      onChange={(e) => updateScoreEntry(index, 'position', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input 
                      type="number" 
                      min="0" 
                      value={entry.points}
                      onChange={(e) => updateScoreEntry(index, 'points', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeScoreEntry(index)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" onClick={addScoreEntry} className="mt-4">
          Adicionar Posição
        </Button>
      </CardContent>
    </Card>
  );
}
