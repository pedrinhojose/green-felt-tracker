
import { useState, useRef } from "react";
import { usePoker } from "@/contexts/PokerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
import { Camera, ImageIcon, X } from "lucide-react";
import { Player } from "@/lib/db/models";

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
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players;
    
  const sortedPlayers = [...filteredPlayers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Camera functions
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Erro",
          description: "Seu navegador não suporta acesso à câmera.",
          variant: "destructive",
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Acesso negado",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive",
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        if (editingPlayer) {
          setEditingPlayer({ ...editingPlayer, photoUrl: imageDataUrl });
        } else {
          setNewPlayer({ ...newPlayer, photoUrl: imageDataUrl });
        }
        
        stopCamera();
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        if (editingPlayer) {
          setEditingPlayer({ ...editingPlayer, photoUrl: imageDataUrl });
        } else {
          setNewPlayer({ ...newPlayer, photoUrl: imageDataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearPhoto = () => {
    if (editingPlayer) {
      setEditingPlayer({ ...editingPlayer, photoUrl: undefined });
    } else {
      setNewPlayer({ ...newPlayer, photoUrl: undefined });
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
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Cleanup camera on unmount
  useState(() => {
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
                  <div className="text-sm text-muted-foreground">
                    {player.city && <p>{player.city}</p>}
                    {player.phone && <p>{player.phone}</p>}
                    <p>Cadastrado em {new Date(player.createdAt).toLocaleDateString()}</p>
                  </div>
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
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) stopCamera();
        setIsAddDialogOpen(open);
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="playerPhone">Telefone</Label>
              <Input
                id="playerPhone"
                value={newPlayer.phone || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="playerCity">Cidade</Label>
              <Input
                id="playerCity"
                value={newPlayer.city || ""}
                onChange={(e) => setNewPlayer({ ...newPlayer, city: e.target.value })}
                placeholder="Cidade do jogador"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Foto do Jogador</Label>
              
              {isCameraActive ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full"
                    />
                    <Button 
                      onClick={() => stopCamera()}
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={capturePhoto} 
                    className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
                  >
                    Tirar Foto
                  </Button>
                </div>
              ) : newPlayer.photoUrl ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img 
                      src={newPlayer.photoUrl} 
                      alt="Foto do jogador" 
                      className="w-full h-auto rounded-lg"
                    />
                    <Button 
                      onClick={clearPhoto}
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={startCamera} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" /> Usar Câmera
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" /> Escolher Arquivo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </div>
              )}
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
      <Dialog 
        open={!!editingPlayer} 
        onOpenChange={(open) => {
          if (!open) stopCamera();
          if (!open) setEditingPlayer(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="editPlayerPhone">Telefone</Label>
                <Input
                  id="editPlayerPhone"
                  value={editingPlayer.phone || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPlayerCity">Cidade</Label>
                <Input
                  id="editPlayerCity"
                  value={editingPlayer.city || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, city: e.target.value })}
                  placeholder="Cidade do jogador"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Foto do Jogador</Label>
                
                {isCameraActive ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full"
                      />
                      <Button 
                        onClick={() => stopCamera()}
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={capturePhoto} 
                      className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
                    >
                      Tirar Foto
                    </Button>
                  </div>
                ) : editingPlayer.photoUrl ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img 
                        src={editingPlayer.photoUrl} 
                        alt="Foto do jogador" 
                        className="w-full h-auto rounded-lg"
                      />
                      <Button 
                        onClick={clearPhoto}
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={startCamera} 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Camera className="mr-2 h-4 w-4" /> Usar Câmera
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      variant="outline" 
                      className="flex-1"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" /> Escolher Arquivo
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
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
