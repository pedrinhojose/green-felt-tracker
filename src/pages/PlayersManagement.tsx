
import { useState } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Player } from "@/lib/db/models";

export default function PlayersManagement() {
  const { players, savePlayer, deletePlayer } = usePoker();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState<{ name: string; photoUrl?: string }>({
    name: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players;
    
  const sortedPlayers = [...filteredPlayers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleAddPlayer = async () => {
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
      await savePlayer(newPlayer);
      setNewPlayer({ name: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "Jogador adicionado",
        description: "O jogador foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer || !editingPlayer.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do jogador.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      await savePlayer(editingPlayer);
      setEditingPlayer(null);
      toast({
        title: "Jogador atualizado",
        description: "As informações do jogador foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      setIsDeleting(true);
      await deletePlayer(playerId);
      toast({
        title: "Jogador removido",
        description: "O jogador foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Jogadores</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-poker-gold hover:bg-poker-gold/80 text-black"
        >
          Adicionar Jogador
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar jogadores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlayers.map(player => (
          <Card key={player.id} className="bg-poker-green">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {player.photoUrl ? (
                    <AvatarImage src={player.photoUrl} alt={player.name} />
                  ) : null}
                  <AvatarFallback className="bg-poker-navy text-white">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{player.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastrado em {new Date(player.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPlayer({ ...player })}
                  >
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Jogador</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir {player.name}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePlayer(player.id)}
                          disabled={isDeleting}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {sortedPlayers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Nenhum jogador encontrado com este termo." : "Nenhum jogador cadastrado ainda."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              Adicionar seu primeiro jogador
            </Button>
          )}
        </div>
      )}
      
      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Jogador</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Nome</Label>
              <Input
                id="playerName"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="Nome do jogador"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photoUrl">URL da Foto (opcional)</Label>
              <Input
                id="photoUrl"
                value={newPlayer.photoUrl || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, photoUrl: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleAddPlayer}
              disabled={isSaving || !newPlayer.name.trim()}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              {isSaving ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
          </DialogHeader>
          
          {editingPlayer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editPlayerName">Nome</Label>
                <Input
                  id="editPlayerName"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  placeholder="Nome do jogador"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPhotoUrl">URL da Foto (opcional)</Label>
                <Input
                  id="editPhotoUrl"
                  value={editingPlayer.photoUrl || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, photoUrl: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={handleEditPlayer}
              disabled={isSaving || !editingPlayer?.name?.trim()}
              className="bg-poker-gold hover:bg-poker-gold/80 text-black"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
