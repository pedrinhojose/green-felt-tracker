
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { SeasonSummary } from "@/hooks/useSeasonReport";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

interface SeasonPrizePoolSummaryProps {
  seasonSummary: SeasonSummary;
}

export default function SeasonPrizePoolSummary({ seasonSummary }: SeasonPrizePoolSummaryProps) {
  const { totalBuyIns, totalRebuys, totalAddons, totalDinnerCost } = seasonSummary;
  
  const pieData = [
    { name: 'Buy-ins', value: totalBuyIns },
    { name: 'Rebuys', value: totalRebuys },
    { name: 'Add-ons', value: totalAddons },
    { name: 'Jantas', value: totalDinnerCost }
  ].filter(item => item.value > 0); // Só mostrar itens com valor > 0
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Calcular o total (incluindo jantas)
  const totalMovement = totalBuyIns + totalRebuys + totalAddons + totalDinnerCost;
  const totalPrizePool = totalBuyIns + totalRebuys + totalAddons;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Resumo Financeiro da Temporada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-muted-foreground">Total Buy-ins:</span>
                <span className="font-semibold">{formatCurrency(totalBuyIns)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-muted-foreground">Total Rebuys:</span>
                <span className="font-semibold">{formatCurrency(totalRebuys)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-muted-foreground">Total Add-ons:</span>
                <span className="font-semibold">{formatCurrency(totalAddons)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-muted-foreground">Total Jantas:</span>
                <span className="font-semibold">{formatCurrency(totalDinnerCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg">Total Premiação:</span>
                <span className="text-lg font-bold text-poker-gold">
                  {formatCurrency(totalPrizePool)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
