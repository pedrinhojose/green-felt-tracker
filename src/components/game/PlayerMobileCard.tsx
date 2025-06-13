
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { GamePlayer, Player, Season } from "@/lib/db/models";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PlayerMobileCardProps {
  gamePlayer: GamePlayer;
  player: Player;
  dinnerSharePerPlayer: number;
  activeSeason: Season | null;
  isFinished: boolean;
  onUpdatePlayerStats: (playerId: string, field: keyof GamePlayer, value: any) => void;
  onEliminatePlayer: (playerId: string) => void;
  onReactivatePlayer: (playerId: string) => void;
}

export function PlayerMobileCard({
  gamePlayer,
  player,
  dinnerSharePerPlayer,
  activeSeason,
  isFinished,
  onUpdatePlayerStats,
  onEliminatePlayer,
  onReactivatePlayer,
}: PlayerMobileCardProps) {
  // Helper function to get player initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className={`${gamePlayer.isEliminated ? 'opacity-60 border-gray-500' : 'border-poker-gold/20'}`}>
      <CardContent className="p-4">
        {/* Header com nome e posição */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12">
            {player.photoUrl ? (
              <AvatarImage src={player.photoUrl} alt={player.name} />
            ) : null}
            <AvatarFallback className="bg-poker-navy text-white">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-medium text-white">{player.name}</h3>
            {gamePlayer.isEliminated && (
              <span className="text-sm text-poker-gold">
                {gamePlayer.position}º lugar
              </span>
            )}
          </div>
          
          {/* Botão de ação */}
          {!isFinished && (
            <div className="flex gap-1">
              {!gamePlayer.isEliminated ? (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onEliminatePlayer(gamePlayer.playerId)}
                  className="text-xs px-2"
                >
                  Eliminar
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onReactivatePlayer(gamePlayer.playerId)}
                  className="border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-black text-xs px-2"
                >
                  Reativar
                </Button>
              )}
            </div>
          )}
        </div>
        
        <Separator className="mb-3" />
        
        {/* Controles de Buy-in e Janta */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Buy-in</span>
              <Checkbox 
                checked={gamePlayer.buyIn}
                onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'buyIn', !!checked)}
                disabled={isFinished}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Janta</span>
              <Checkbox 
                checked={gamePlayer.joinedDinner}
                onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'joinedDinner', !!checked)}
                disabled={isFinished}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-right">
              <span className="text-sm text-muted-foreground block">Custo Janta</span>
              <span className="text-sm font-medium">
                {gamePlayer.joinedDinner ? formatCurrency(dinnerSharePerPlayer) : '-'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Controles de Rebuys e Add-ons */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-sm text-muted-foreground block mb-1">Rebuys</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'rebuys', 
                  Math.max(0, gamePlayer.rebuys - 1)
                )}
                disabled={gamePlayer.rebuys === 0 || isFinished}
              >
                -
              </Button>
              
              <span className="w-6 text-center font-medium">{gamePlayer.rebuys}</span>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'rebuys', 
                  gamePlayer.rebuys + 1
                )}
                disabled={isFinished}
              >
                +
              </Button>
            </div>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground block mb-1">Add-ons</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'addons', 
                  Math.max(0, gamePlayer.addons - 1)
                )}
                disabled={gamePlayer.addons === 0 || isFinished}
              >
                -
              </Button>
              
              <span className="w-6 text-center font-medium">{gamePlayer.addons}</span>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'addons', 
                  gamePlayer.addons + 1
                )}
                disabled={isFinished}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="mb-3" />
        
        {/* Resumo financeiro */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-xs text-muted-foreground block">Prêmio</span>
            <span className="text-sm font-medium text-poker-gold">
              {formatCurrency(gamePlayer.prize)}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground block">Pontos</span>
            <span className="text-sm font-medium">
              {gamePlayer.points}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground block">Saldo</span>
            <span className={`text-sm font-medium ${
              gamePlayer.balance < 0 ? 'text-poker-red' : 'text-poker-blue'
            }`}>
              {formatCurrency(gamePlayer.balance)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
