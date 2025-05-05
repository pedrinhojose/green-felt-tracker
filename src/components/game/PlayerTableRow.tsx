
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { GamePlayer, Player, Season } from "@/lib/db/models";

interface PlayerTableRowProps {
  gamePlayer: GamePlayer;
  player: Player;
  dinnerSharePerPlayer: number;
  activeSeason: Season | null;
  isFinished: boolean;
  onUpdatePlayerStats: (playerId: string, field: keyof GamePlayer, value: any) => void;
  onEliminatePlayer: (playerId: string) => void;
}

export function PlayerTableRow({
  gamePlayer,
  player,
  dinnerSharePerPlayer,
  activeSeason,
  isFinished,
  onUpdatePlayerStats,
  onEliminatePlayer,
}: PlayerTableRowProps) {
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
    <tr 
      className={`border-b border-poker-dark-green ${
        gamePlayer.isEliminated ? 'opacity-60' : ''
      }`}
    >
      <td className="p-2 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          {player.photoUrl ? (
            <AvatarImage src={player.photoUrl} alt={player.name} />
          ) : null}
          <AvatarFallback className="bg-poker-navy text-white text-xs">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <span>{player.name}</span>
          {gamePlayer.isEliminated && (
            <span className="text-xs text-poker-gold">
              {gamePlayer.position}º lugar
            </span>
          )}
        </div>
      </td>
      
      <td className="p-2 text-center">
        <Checkbox 
          checked={gamePlayer.buyIn}
          onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'buyIn', !!checked)}
          disabled={isFinished}
        />
      </td>
      
      <td className="p-2 text-center">
        <div className="flex justify-center items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
            onClick={() => onUpdatePlayerStats(
              gamePlayer.playerId, 
              'rebuys', 
              Math.max(0, gamePlayer.rebuys - 1)
            )}
            disabled={gamePlayer.rebuys === 0 || isFinished}
          >
            -
          </Button>
          
          <span className="w-4 text-center">{gamePlayer.rebuys}</span>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
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
      </td>
      
      <td className="p-2 text-center">
        <div className="flex justify-center items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
            onClick={() => onUpdatePlayerStats(
              gamePlayer.playerId, 
              'addons', 
              Math.max(0, gamePlayer.addons - 1)
            )}
            disabled={gamePlayer.addons === 0 || isFinished}
          >
            -
          </Button>
          
          <span className="w-4 text-center">{gamePlayer.addons}</span>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
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
      </td>
      
      <td className="p-2 text-center">
        <Checkbox 
          checked={gamePlayer.joinedDinner}
          onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'joinedDinner', !!checked)}
          disabled={isFinished}
        />
      </td>
      
      <td className="p-2 text-center">
        {gamePlayer.joinedDinner ? formatCurrency(dinnerSharePerPlayer) : '-'}
      </td>
      
      <td className="p-2 text-center font-medium">
        {formatCurrency(gamePlayer.prize)}
      </td>
      
      <td className="p-2 text-center font-medium">
        {gamePlayer.points}
      </td>
      
      <td className={`p-2 text-center font-medium ${
        gamePlayer.balance < 0 ? 'text-poker-red' : 'text-poker-blue'
      }`}>
        {formatCurrency(gamePlayer.balance)}
      </td>
      
      <td className="p-2 text-right">
        {!gamePlayer.isEliminated && !isFinished && (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onEliminatePlayer(gamePlayer.playerId)}
          >
            Eliminar
          </Button>
        )}
      </td>
    </tr>
  );
}
