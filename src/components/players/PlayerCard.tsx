import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, UserMinus, UserPlus, Cake } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Player } from "@/lib/db/models";

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDeactivate: (playerId: string) => void;
  onReactivate: (playerId: string) => void;
  isDeleting: boolean;
}

// Parse date string as local date (avoiding UTC timezone issues)
function parseLocalDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function PlayerCard({ player, onEdit, onDeactivate, onReactivate, isDeleting }: PlayerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const age = player.birthDate ? calculateAge(parseLocalDate(player.birthDate)) : null;
  const isInactive = player.isActive === false;

  return (
    <Card className={`overflow-hidden border transition-colors ${
      isInactive 
        ? 'border-muted/30 bg-muted/20 opacity-60' 
        : 'border-white/10 bg-poker-navy/40 hover:bg-poker-navy/60'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className={`h-12 w-12 border-2 ${isInactive ? 'border-muted/30' : 'border-poker-gold/50'}`}>
            {player.photoUrl ? (
              <AvatarImage src={player.photoUrl} alt={player.name} />
            ) : null}
            <AvatarFallback className={`font-medium ${isInactive ? 'bg-muted/30 text-muted-foreground' : 'bg-poker-gold/20 text-white'}`}>
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium truncate ${isInactive ? 'text-muted-foreground' : 'text-white'}`}>
                {player.name}
              </h3>
              {isInactive && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Inativo
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-sm ${isInactive ? 'text-muted-foreground/60' : 'text-white/60'}`}>
              {player.city && <span className="truncate">{player.city}</span>}
              {player.city && age !== null && <span>•</span>}
              {age !== null && (
                <span className="flex items-center gap-1">
                  <Cake className="h-3 w-3" />
                  {age} anos
                </span>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(player)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              
              {isInactive ? (
                <DropdownMenuItem 
                  onClick={() => onReactivate(player.id)}
                  disabled={isDeleting}
                  className="text-green-600 focus:text-green-600"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Reativar
                </DropdownMenuItem>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()} 
                      className="text-destructive focus:text-destructive"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Desativar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desativar Jogador</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deseja desativar <strong>{player.name}</strong>? 
                        <br /><br />
                        O jogador não aparecerá mais nas seleções de novas partidas, mas todo o seu histórico (partidas, pontuação, ranking) será preservado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeactivate(player.id)}
                        disabled={isDeleting}
                      >
                        Desativar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
