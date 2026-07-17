import { usePoker } from "@/contexts/PokerContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Dropdown that lets the user switch which season is "current" for the app.
 * The choice is persisted per organization in localStorage via OrganizationContext.
 */
export function SeasonSelector() {
  const { seasons, activeSeason } = usePoker();
  const { selectedSeasonId, setSelectedSeasonId, currentOrganization } = useOrganization();

  if (!currentOrganization || seasons.length === 0) return null;

  const current = selectedSeasonId || activeSeason?.id || "";

  const sorted = [...seasons].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <Select
      value={current}
      onValueChange={(v) => setSelectedSeasonId(v)}
    >
      <SelectTrigger className="h-8 w-[200px] bg-white/5 border-white/10 text-white text-xs">
        <SelectValue placeholder="Temporada" />
      </SelectTrigger>
      <SelectContent>
        {sorted.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name} {s.isActive ? "· ativa" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
