import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, MapPin, Phone, Calendar, Edit } from "lucide-react";
import { Player, Game } from "@/lib/db/models";
import { formatDistanceToNowStrict, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePoker } from "@/contexts/PokerContext";

interface PlayerDetailsDialogProps {
  player: Player | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (player: Player) => void;
}

function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const [year, month, day] = String(dateStr).split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
}

export function PlayerDetailsDialog({ player, onOpenChange, onEdit }: PlayerDetailsDialogProps) {
  const { games } = usePoker();

  const lastGame = useMemo<Game | null>(() => {
    if (!player) return null;
    const played = games
      .filter(g => g.players?.some(p => p.playerId === player.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return played[0] ?? null;
  }, [games, player]);

  if (!player) return null;

  const age = player.birthDate ? calculateAge(parseLocalDate(player.birthDate as any)) : null;

  const lastLabel = lastGame
    ? (() => {
        const d = new Date(lastGame.date);
        return `${format(d, "dd/MM/yyyy", { locale: ptBR })} (há ${formatDistanceToNowStrict(d, { locale: ptBR })})`;
      })()
    : "Nunca participou";

  return (
    <Dialog open={!!player} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Jogador</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="h-40 w-40 border-4 border-poker-gold/50">
            {player.photoUrl ? <AvatarImage src={player.photoUrl} alt={player.name} /> : null}
            <AvatarFallback className="bg-poker-gold/20 text-white text-3xl font-medium">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-semibold text-center">{player.name}</h2>

          <div className="w-full space-y-2 text-sm">
            {player.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cidade:</span>
                <span>{player.city}</span>
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Telefone:</span>
                <span>{player.phone}</span>
              </div>
            )}
            {age !== null && (
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Idade:</span>
                <span>
                  {age} anos
                  {player.birthDate && (
                    <span className="text-muted-foreground ml-1">
                      ({format(parseLocalDate(player.birthDate as any), "dd/MM/yyyy")})
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Última participação:</span>
              <span>{lastLabel}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button
            onClick={() => { onEdit(player); onOpenChange(false); }}
            className="bg-poker-gold hover:bg-poker-gold/80 text-black"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
