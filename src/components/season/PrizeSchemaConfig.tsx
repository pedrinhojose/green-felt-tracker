
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrizeEntry } from "@/types/season";

interface PrizeSchemaConfigProps {
  entries: PrizeEntry[];
  onChange: (entries: PrizeEntry[]) => void;
  title: string;
}

export function PrizeSchemaConfig({ entries, onChange, title }: PrizeSchemaConfigProps) {
  const updateEntry = (index: number, field: 'position' | 'percentage', value: number) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    onChange(newEntries);
  };

  const addEntry = () => {
    const newPosition = entries.length > 0 
      ? Math.max(...entries.map(e => e.position)) + 1 
      : 1;
    onChange([...entries, { position: newPosition, percentage: 0 }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const totalPercentage = entries.reduce((sum, entry) => sum + entry.percentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-poker-dark-green">
                <th className="text-left p-2">Posição</th>
                <th className="text-left p-2">Porcentagem (%)</th>
                <th className="text-right p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="border-b border-poker-dark-green">
                  <td className="p-2">
                    <Input 
                      type="number" 
                      min="1" 
                      value={entry.position}
                      onChange={(e) => updateEntry(index, 'position', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={entry.percentage}
                      onChange={(e) => updateEntry(index, 'percentage', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeEntry(index)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-2 font-semibold">Total:</td>
                <td className="p-2 font-semibold">
                  {totalPercentage}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Button type="button" onClick={addEntry} className="mt-4">
          Adicionar Posição
        </Button>
      </CardContent>
    </Card>
  );
}
