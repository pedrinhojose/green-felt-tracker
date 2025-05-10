
import { useState, useEffect } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { useToast } from "@/components/ui/use-toast";
import { Player } from "@/lib/db/models";
import { usePlayerPhotoManager } from "@/hooks/usePlayerPhotoManager";
import { AddPlayerDialog } from "@/components/players/AddPlayerDialog";
import { EditPlayerDialog } from "@/components/players/EditPlayerDialog";
import { PlayersHeader } from "@/components/players/PlayersHeader";
import { PlayerSearch } from "@/components/players/PlayerSearch";
import { PlayersList } from "@/components/players/PlayersList";

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
  
  // Use our new photo manager hook
  const photoManager = usePlayerPhotoManager();
  
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players;
  
  // Clear photo in edit mode
  const clearPhoto = () => {
    if (editingPlayer) {
      setEditingPlayer({ ...editingPlayer, photoUrl: undefined });
    } else {
      setNewPlayer({ ...newPlayer, photoUrl: undefined });
    }
    photoManager.clearPhoto();
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
      await savePlayer(newPlayer); // This is now correct as we updated savePlayer to accept Partial<Player>
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
        description: error instanceof Error ? error.message : "Não foi possível adicionar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      photoManager.stopCamera();
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
      await savePlayer(editingPlayer); // This is already a complete Player object, so it works fine
      setEditingPlayer(null);
      toast({
        title: "Jogador atualizado",
        description: "As informações do jogador foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o jogador.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      photoManager.stopCamera();
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
      photoManager.stopCamera();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <PlayersHeader onAddPlayer={() => setIsAddDialogOpen(true)} />
      <PlayerSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <PlayersList 
        players={filteredPlayers} 
        searchQuery={searchQuery}
        onAddPlayer={() => setIsAddDialogOpen(true)}
        onEditPlayer={setEditingPlayer}
        onDeletePlayer={handleDeletePlayer}
        isDeleting={isDeleting}
      />
      
      {/* Add Player Dialog */}
      <AddPlayerDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newPlayer={newPlayer}
        setNewPlayer={setNewPlayer}
        isSaving={isSaving}
        handleAddPlayer={handleAddPlayer}
        isCameraActive={photoManager.isCameraActive}
        setIsCameraActive={photoManager.setIsCameraActive}
        videoRef={photoManager.videoRef}
        fileInputRef={photoManager.fileInputRef}
        startCamera={photoManager.startCamera}
        stopCamera={photoManager.stopCamera}
        capturePhoto={photoManager.capturePhoto}
        handleFileUpload={photoManager.handleFileUpload}
        clearPhoto={clearPhoto}
        isProcessing={photoManager.isProcessing}
      />
      
      {/* Edit Player Dialog */}
      <EditPlayerDialog
        editingPlayer={editingPlayer}
        setEditingPlayer={setEditingPlayer}
        isSaving={isSaving}
        handleEditPlayer={handleEditPlayer}
        isCameraActive={photoManager.isCameraActive}
        setIsCameraActive={photoManager.setIsCameraActive}
        videoRef={photoManager.videoRef}
        fileInputRef={photoManager.fileInputRef}
        startCamera={photoManager.startCamera}
        stopCamera={photoManager.stopCamera}
        capturePhoto={photoManager.capturePhoto}
        handleFileUpload={photoManager.handleFileUpload}
        clearPhoto={clearPhoto}
        isProcessing={photoManager.isProcessing}
      />
    </div>
  );
}
