
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player, GamePlayer, Season, Game } from "@/lib/db/models";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlayerSearch } from "@/components/players/PlayerSearch";
import { AddPlayerDialog } from "@/components/players/AddPlayerDialog";
import { usePlayerPhotoManager } from "@/hooks/usePlayerPhotoManager";
import { usePoker } from "@/contexts/PokerContext";
import { UserPlus, AlertCircle, PiggyBank, X } from "lucide-react";
import { useReceivables } from "@/hooks/useReceivables";
import { formatCurrency } from "@/lib/utils/dateUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCaixinhaMonthlyStatus } from "@/hooks/useCaixinhaMonthlyStatus";



interface PlayerSelectionProps {
  players: Player[];
  onStartGame: (selectedPlayerIds: Set<string>) => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  season?: Season;
  game?: Game;
}

export default function PlayerSelection({ players, onStartGame, onCancel, isCancelling, season, game }: PlayerSelectionProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPlayer, setNewPlayer] = useState<{
    name: string;
    photoUrl?: string;
    phone?: string;
    city?: string;
  }>({ name: "" });
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { savePlayer } = usePoker();
  const photoManager = usePlayerPhotoManager();
  const { receivablesByPlayer } = useReceivables();
  const openBalanceMap = new Map(receivablesByPlayer.map(p => [p.playerId, p]));
  const { hasPaidThisMonth } = useCaixinhaMonthlyStatus(game ?? null);


  
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
  const sortedPlayersAll = [...players].sort((a, b) =>
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

  const clearNewPlayerPhoto = () => {
    setNewPlayer({ ...newPlayer, photoUrl: undefined });
    photoManager.clearPhoto();
  };

  const handleAddNewPlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do jogador.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const newId = await savePlayer(newPlayer);
      // Pré-selecionar automaticamente o novo jogador
      if (newId) {
        setSelectedPlayers(prev => {
          const next = new Set(prev);
          next.add(newId);
          return next;
        });
      }
      setNewPlayer({ name: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "Jogador adicionado",
        description: "O jogador foi adicionado e já está selecionado.",
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      photoManager.stopCamera();
    }
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
        <div className={`flex ${isMobile ? "flex-col" : "flex-row items-start"} gap-2 mb-2`}>
          <div className="flex-1 w-full">
            <PlayerSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddDialogOpen(true)}
            className={`${isMobile ? "w-full" : ""} bg-poker-gold hover:bg-poker-gold/80 text-black border-poker-gold`}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo jogador
          </Button>
        </div>
        
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
        
        {selectedPlayers.size > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sortedPlayersAll.filter(p => selectedPlayers.has(p.id)).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlayerSelection(p.id)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-poker-gold/20 border border-poker-gold/40 hover:bg-poker-gold/30"
              >
                {p.name} <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {sortedPlayers.length > 0 && (
          <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {sortedPlayers.map((player, idx) => {
              const letter = player.name.charAt(0).toLocaleUpperCase('pt-BR');
              const prevLetter = idx > 0 ? sortedPlayers[idx - 1].name.charAt(0).toLocaleUpperCase('pt-BR') : null;
              const openBal = openBalanceMap.get(player.id);
              const net = openBal?.netBalance ?? 0;
              const hasOpen = !!openBal && net !== 0;
              const selected = selectedPlayers.has(player.id);
              return (
                <div key={player.id}>
                  {letter !== prevLetter && (
                    <div className="px-3 py-1 text-xs font-bold text-poker-gold bg-muted/40">{letter}</div>
                  )}
                  <div
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors border-l-4 ${
                      selected ? 'border-l-poker-gold bg-poker-gold/10' : 'border-l-transparent hover:bg-muted/40'
                    }`}
                  >
                    <span className={`flex-1 truncate ${selected ? 'font-semibold' : ''}`}>{player.name}</span>
                    {hasOpen && (
                      <span
                        title={`${openBal!.openCount} partida(s) em aberto — ver Recebimentos`}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          net < 0
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        {net < 0 ? '-' : '+'}{formatCurrency(Math.abs(net))}
                      </span>
                    )}
                    {!game?.isStandalone && hasPaidThisMonth(player.id) && (
                      <span
                        title="Já contribuiu para o caixinha neste mês — não será cobrado novamente"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-primary/15 text-primary border-primary/30"
                      >
                        <PiggyBank className="w-3 h-3" />
                        {isMobile ? "Pago" : "Caixinha paga"}
                      </span>
                    )}
                    <Checkbox checked={selected} className="pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={`sticky bottom-0 bg-card py-3 mt-4 flex ${isMobile ? "flex-col" : "flex-row justify-center"} gap-3 border-t border-border`}>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCancelling}
              className={isMobile ? "w-full py-3 text-lg" : ""}
            >
              {isCancelling ? "Cancelando..." : "Cancelar"}
            </Button>
          )}
          <Button
            onClick={handleStartGame}
            disabled={selectedPlayers.size === 0 || isCancelling}
            className={`bg-poker-gold hover:bg-poker-gold/80 text-black ${
              isMobile ? "w-full py-3 text-lg" : ""
            }`}
          >
            Iniciar Partida ({selectedPlayers.size})
          </Button>
        </div>
      </CardContent>
    </Card>

    <AddPlayerDialog
      isOpen={isAddDialogOpen}
      onOpenChange={setIsAddDialogOpen}
      newPlayer={newPlayer}
      setNewPlayer={setNewPlayer}
      isSaving={isSaving}
      handleAddPlayer={handleAddNewPlayer}
      isCameraActive={photoManager.isCameraActive}
      setIsCameraActive={photoManager.setIsCameraActive}
      videoRef={photoManager.videoRef}
      fileInputRef={photoManager.fileInputRef}
      startCamera={photoManager.startCamera}
      stopCamera={photoManager.stopCamera}
      capturePhoto={async () => {
        const url = await photoManager.capturePhoto();
        if (url) setNewPlayer(prev => ({ ...prev, photoUrl: url }));
        return url;
      }}
      handleFileUpload={async (e) => {
        const url = await photoManager.handleFileUpload(e);
        if (url) setNewPlayer(prev => ({ ...prev, photoUrl: url }));
        return url;
      }}
      clearPhoto={clearNewPlayerPhoto}
      isProcessing={photoManager.isProcessing}
    />
    </div>
  );
}
