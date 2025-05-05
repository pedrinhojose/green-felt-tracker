
import { Season } from "@/lib/db/models";
import { formatCurrency } from "@/lib/utils/dateUtils";

interface PlayerTableHeaderProps {
  activeSeason: Season | null;
}

export function PlayerTableHeader({ activeSeason }: PlayerTableHeaderProps) {
  return (
    <tr className="border-b border-poker-dark-green">
      <th className="text-left py-2 px-2">Jogador</th>
      <th className="text-center p-2">Buy-In</th>
      <th className="text-center p-2">
        <div>Rebuys</div>
        <div className="text-xs text-muted-foreground">
          {activeSeason ? formatCurrency(activeSeason.financialParams.rebuy) : 'R$ 0,00'}
        </div>
      </th>
      <th className="text-center p-2">
        <div>Add-ons</div>
        <div className="text-xs text-muted-foreground">
          {activeSeason ? formatCurrency(activeSeason.financialParams.addon) : 'R$ 0,00'}
        </div>
      </th>
      <th className="text-center p-2">Janta</th>
      <th className="text-center p-2">Valor Janta</th>
      <th className="text-center p-2">Prêmio</th>
      <th className="text-center p-2">Pontos</th>
      <th className="text-center p-2">Saldo</th>
      <th className="text-right p-2">Ações</th>
    </tr>
  );
}
