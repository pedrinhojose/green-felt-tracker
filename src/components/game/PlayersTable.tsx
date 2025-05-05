
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Game, GamePlayer, Player, Season } from "@/lib/db/models";

interface PlayersTableProps {
  game: Game;
  players: Player[];
  activeSeason: Season | null;
  onEliminatePlayer: (playerId: string) => void;
  onUpdatePlayerStats: (playerId: string, field: keyof GamePlayer, value: any) => void;
}

export default function PlayersTable({
  game,
  players,
  activeSeason,
  onEliminatePlayer,
  onUpdatePlayerStats,
}: PlayersTableProps) {
  
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Jogador Desconhecido';
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between">
          <span>Jogadores</span>
          <span>{game.players.length} participantes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
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
                <th className="text-center p-2">Prêmio</th>
                <th className="text-center p-2">Pontos</th>
                <th className="text-center p-2">Saldo</th>
                <th className="text-right p-2">Ações</th>
              </tr>
            </thead>
            
            <tbody>
              {game.players.map((gamePlayer) => {
                const player = players.find(p => p.id === gamePlayer.playerId);
                if (!player) return null;
                
                return (
                  <tr 
                    key={gamePlayer.playerId}
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
                        disabled={game.isFinished}
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
                          disabled={gamePlayer.rebuys === 0 || game.isFinished}
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
                          disabled={game.isFinished}
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
                          disabled={gamePlayer.addons === 0 || game.isFinished}
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
                          disabled={game.isFinished}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    
                    <td className="p-2 text-center">
                      <Checkbox 
                        checked={gamePlayer.joinedDinner}
                        onCheckedChange={(checked) => onUpdatePlayerStats(gamePlayer.playerId, 'joinedDinner', !!checked)}
                        disabled={game.isFinished}
                      />
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
                      {!gamePlayer.isEliminated && !game.isFinished && (
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
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
