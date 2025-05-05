
import { useState, useEffect } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/lib/db/models";
import { PlayerCard } from "@/components/players/PlayerCard";
import { AddPlayerDialog } from "@/components/players/AddPlayerDialog";
import { EditPlayerDialog } from "@/components/players/EditPlayerDialog";
import { usePlayerPhoto } from "@/hooks/usePlayerPhoto";

export default function PlayersManagement() {
  const { players, savePlayer, deletePlayer } = usePoker();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayer, setNewPlayer] = useState<{ 
    name: string; 
    photoUrl?: string;
    phone?: string;
    city?: string;
  }>({
    name: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    isCameraActive,
    setIsCameraActive,
    videoRef,
    fileInputRef,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileUpload
  } = usePlayerPhoto();
  
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players;
    
  const sortedPlayers = [...filteredPlayers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Photo handling functions for add/edit forms
  const clearPhoto = () => {
    if (editingPlayer) {
      setEditingPlayer({ ...editingPlayer, photoUrl: undefined });
    } else {
      setNewPlayer({ ...newPlayer, photoUrl: undefined });
    }
  };
  
  const handleCapturePhoto = () => {
    const photoDataUrl = capturePhoto();
    if (photoDataUrl) {
      if (editingPlayer) {
        setEditingPlayer({ ...editingPlayer, photoUrl: photoDataUrl });
      } else {
        setNewPlayer({ ...newPlayer, photoUrl: photoDataUrl });
      }
    }
  };
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photoDataUrl = await handleFileUpload(e);
    if (photoDataUrl) {
      if (editingPlayer) {
        setEditingPlayer({ ...editingPlayer, photoUrl: photoDataUrl });
      } else {
        setNewPlayer({ ...newPlayer, photoUrl: photoDataUrl });
      }
    }
  };

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
      stopCamera();
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
      stopCamera();
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
  
  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
          <PlayerCard
            key={player.id}
            player={player}
            onEdit={setEditingPlayer}
            onDelete={handleDeletePlayer}
            isDeleting={isDeleting}
          />
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
      <AddPlayerDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newPlayer={newPlayer}
        setNewPlayer={setNewPlayer}
        isSaving={isSaving}
        handleAddPlayer={handleAddPlayer}
        isCameraActive={isCameraActive}
        setIsCameraActive={setIsCameraActive}
        videoRef={videoRef}
        fileInputRef={fileInputRef}
        startCamera={startCamera}
        stopCamera={stopCamera}
        capturePhoto={handleCapturePhoto}
        handleFileUpload={handleFileInputChange}
        clearPhoto={clearPhoto}
      />
      
      {/* Edit Player Dialog */}
      <EditPlayerDialog
        editingPlayer={editingPlayer}
        setEditingPlayer={setEditingPlayer}
        isSaving={isSaving}
        handleEditPlayer={handleEditPlayer}
        isCameraActive={isCameraActive}
        setIsCameraActive={setIsCameraActive}
        videoRef={videoRef}
        fileInputRef={fileInputRef}
        startCamera={startCamera}
        stopCamera={stopCamera}
        capturePhoto={handleCapturePhoto}
        handleFileUpload={handleFileInputChange}
        clearPhoto={clearPhoto}
      />
    </div>
  );
}
