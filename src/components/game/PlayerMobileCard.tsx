
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { GamePlayer, Player, Season } from "@/lib/db/models";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <Card className={`transition-all duration-200 shadow-mobile ${gamePlayer.isEliminated ? 'opacity-60 border-gray-500' : 'border-poker-gold/20'}`}>
      <CardContent className="p-3">
        {/* Header com nome e posição */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex-shrink-0`}>
            {player.photoUrl ? (
              <AvatarImage src={player.photoUrl} alt={player.name} />
            ) : null}
            <AvatarFallback className="bg-poker-navy text-white text-xs">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">{player.name}</h3>
            {gamePlayer.isEliminated && (
              <Badge variant="outline" className="text-xs text-poker-gold border-poker-gold/50">
                {gamePlayer.position}º lugar
              </Badge>
            )}
          </div>
          
          {/* Botão de ação */}
          {!isFinished && (
            <div className="flex gap-1 flex-shrink-0">
              {!gamePlayer.isEliminated ? (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onEliminatePlayer(gamePlayer.playerId)}
                  className="text-xs px-2 h-8"
                >
                  Eliminar
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onReactivatePlayer(gamePlayer.playerId)}
                  className="border-poker-gold text-poker-gold hover:bg-poker-gold hover:text-black text-xs px-2 h-8"
                >
                  Reativar
                </Button>
              )}
            </div>
          )}
        </div>
        
        <Separator className="mb-3" />
        
        {/* Controles de Buy-in e Janta */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Buy-in</span>
              <Checkbox 
                checked={gamePlayer.buyIn}
                onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'buyIn', !!checked)}
                disabled={isFinished}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Janta</span>
              <Checkbox 
                checked={gamePlayer.joinedDinner}
                onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'joinedDinner', !!checked)}
                disabled={isFinished}
                className="h-4 w-4"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Custo Janta</span>
              <span className="text-xs font-medium text-poker-gold">
                {gamePlayer.joinedDinner ? formatCurrency(dinnerSharePerPlayer) : '-'}
              </span>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Caixinha</span>
              <span className="text-xs font-medium text-poker-blue">
                {activeSeason?.financialParams.clubFundContribution && activeSeason.financialParams.clubFundContribution > 0 
                  ? formatCurrency(activeSeason.financialParams.clubFundContribution)
                  : 'Isento'
                }
              </span>
            </div>
          </div>
        </div>
        
        {/* Controles de Rebuys e Add-ons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Rebuys</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0 text-xs"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'rebuys', 
                  Math.max(0, gamePlayer.rebuys - 1)
                )}
                disabled={gamePlayer.rebuys === 0 || isFinished}
              >
                -
              </Button>
              
              <span className="w-6 text-center font-medium text-xs">{gamePlayer.rebuys}</span>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0 text-xs"
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
            <span className="text-xs text-muted-foreground block mb-1">Add-ons</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0 text-xs"
                onClick={() => onUpdatePlayerStats(
                  gamePlayer.playerId, 
                  'addons', 
                  Math.max(0, gamePlayer.addons - 1)
                )}
                disabled={gamePlayer.addons === 0 || isFinished}
              >
                -
              </Button>
              
              <span className="w-6 text-center font-medium text-xs">{gamePlayer.addons}</span>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0 text-xs"
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
            <span className="text-xs font-medium text-poker-gold">
              {formatCurrency(gamePlayer.prize)}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground block">Pontos</span>
            <span className="text-xs font-medium">
              {gamePlayer.points}
            </span>
          </div>
          
          <div>
            <span className="text-xs text-muted-foreground block">Saldo</span>
            <span className={`text-xs font-medium ${
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
