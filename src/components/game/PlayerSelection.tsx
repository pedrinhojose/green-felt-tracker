
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player, GamePlayer, Season, Game } from "@/lib/db/models";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerSearch } from "@/components/players/PlayerSearch";


interface PlayerSelectionProps {
  players: Player[];
  onStartGame: (selectedPlayerIds: Set<string>) => void;
  season?: Season;
  game?: Game;
}

export default function PlayerSelection({ players, onStartGame, season, game }: PlayerSelectionProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Filter players based on search query and active status (only active players)
  const filteredPlayers = players
    .filter(player => player.isActive !== false)
    .filter(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Sort players alphabetically by name
  const sortedPlayers = [...filteredPlayers].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );
  
  // Get number of columns based on screen size
  const getColumnCount = () => {
    if (isMobile) return 1;
    if (sortedPlayers.length <= 8) return 2;
    return 3;
  };
  
  const columnCount = getColumnCount();
  
  // Function to organize players vertically by columns (A,B,C in col1, D,E,F in col2, etc.)
  const organizePlayersVertically = (players: Player[], columns: number) => {
    if (columns === 1) return players;
    
    const itemsPerColumn = Math.ceil(players.length / columns);
    const organized: Player[] = [];
    
    for (let col = 0; col < columns; col++) {
      const start = col * itemsPerColumn;
      const end = Math.min(start + itemsPerColumn, players.length);
      organized.push(...players.slice(start, end));
    }
    
    return organized;
  };
  
  const playersOrganizedVertically = organizePlayersVertically(sortedPlayers, columnCount);
  
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(playerId)) {
        newSelected.delete(playerId);
      } else {
        newSelected.add(playerId);
      }
      return newSelected;
    });
  };
  
  const handleStartGame = () => {
    if (selectedPlayers.size === 0) {
      toast({
        title: "Nenhum jogador selecionado",
        description: "Selecione pelo menos um jogador para iniciar a partida",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar duplicatas (por segurança adicional)
    const uniqueIds = new Set<string>();
    let hasDuplicates = false;
    
    selectedPlayers.forEach(id => {
      if (uniqueIds.has(id)) {
        hasDuplicates = true;
      }
      uniqueIds.add(id);
    });
    
    if (hasDuplicates) {
      toast({
        title: "Jogadores duplicados",
        description: "Existem jogadores duplicados na seleção. Isso não deveria acontecer.",
        variant: "destructive",
      });
      return;
    }
    
    onStartGame(selectedPlayers);
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
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className={isMobile ? "text-lg" : ""}>Selecionar Jogadores</span>
            <span className={`text-sm bg-poker-gold/20 px-2 py-1 rounded ${isMobile ? "self-start" : ""}`}>
              {selectedPlayers.size} selecionados
            </span>
          </CardTitle>
        </CardHeader>
      <CardContent className={isMobile ? "px-3" : ""}>
        <PlayerSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        {sortedPlayers.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum jogador encontrado com "{searchQuery}"
            </p>
          </div>
        )}
        
        {sortedPlayers.length === 0 && !searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum jogador disponível
            </p>
          </div>
        )}
        
        {sortedPlayers.length > 0 && (
           <div className={`grid gap-2 ${
            isMobile 
              ? "grid-cols-1" 
              : columnCount === 2 ? "grid-cols-2" : "grid-cols-3"
          }`} style={{ 
            gridAutoFlow: columnCount > 1 ? 'column' : 'row',
            gridTemplateRows: columnCount > 1 ? `repeat(${Math.ceil(sortedPlayers.length / columnCount)}, minmax(0, 1fr))` : undefined
          }}>
            {playersOrganizedVertically.map(player => (
              <div 
                key={player.id}
                className={`${
                  isMobile ? "p-3" : "p-3"
                } rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                  selectedPlayers.has(player.id) 
                    ? 'bg-poker-dark-green border border-poker-gold shadow-lg' 
                    : 'bg-poker-dark-green/50 hover:bg-poker-dark-green/70'
                }`}
                onClick={() => togglePlayerSelection(player.id)}
              >
                <Avatar className={isMobile ? "h-10 w-10" : "h-10 w-10"}>
                  {player.photoUrl ? (
                    <AvatarImage src={player.photoUrl} alt={player.name} />
                  ) : null}
                  <AvatarFallback className="bg-poker-navy text-white">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                
                <span className={`flex-1 ${isMobile ? "text-base" : ""}`}>{player.name}</span>
                
                <Checkbox 
                  checked={selectedPlayers.has(player.id)}
                  onCheckedChange={() => togglePlayerSelection(player.id)}
                  className="pointer-events-none"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className={`${isMobile ? "mt-4" : "mt-6"} flex justify-center`}>
          <Button
            onClick={handleStartGame}
            disabled={selectedPlayers.size === 0}
            className={`bg-poker-gold hover:bg-poker-gold/80 text-black ${
              isMobile ? "w-full py-3 text-lg" : ""
            }`}
          >
            Iniciar Partida
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
