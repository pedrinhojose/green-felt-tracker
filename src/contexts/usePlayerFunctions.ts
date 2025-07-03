
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../lib/db/models';
import { pokerDB } from '../lib/db';
import { useToast } from '@/components/ui/use-toast';
import { deleteImageFromStorage } from '@/lib/utils/storageUtils';

export function usePlayerFunctions() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { toast } = useToast();

  const getPlayer = async (id: string): Promise<Player | undefined> => {
    try {
      return await pokerDB.getPlayer(id);
    } catch (error) {
      console.error("Error fetching player:", error);
      toast({
        title: "Erro ao buscar jogador",
        description: "Não foi possível obter os dados do jogador",
        variant: "destructive",
      });
      return undefined;
    }
  };
  
  // Função para normalizar nomes (remover espaços extras e padronizar capitalização)
  const normalizeName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ');
  };
  
  // Função para verificar se já existe um jogador com o mesmo nome
  const checkDuplicateName = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const allPlayers = await pokerDB.getPlayers();
      const normalizedName = normalizeName(name).toLowerCase();
      
      return allPlayers.some(player => 
        player.name.toLowerCase() === normalizedName && 
        player.id !== excludeId
      );
    } catch (error) {
      console.error("Error checking for duplicate names:", error);
      return false; // Assume no duplicate on error to avoid blocking save
    }
  };

  const savePlayer = async (playerData: Partial<Player>): Promise<string> => {
    const now = new Date();
    let player: Player;
    
    try {
      // Normaliza o nome
      if (playerData.name) {
        playerData.name = normalizeName(playerData.name);
      }
      
      // Check if the name is empty
      if (!playerData.name || playerData.name.trim() === '') {
        throw new Error('Nome do jogador é obrigatório');
      }
      
      // Verifica se é uma atualização ou criação
      if (playerData.id) {
        console.log("Updating player", playerData.id);
        const existingPlayer = await pokerDB.getPlayer(playerData.id);
        if (!existingPlayer) {
          throw new Error('Jogador não encontrado');
        }
        
        // Se o nome está sendo alterado, verifica se já existe
        if (playerData.name && playerData.name !== existingPlayer.name) {
          const isDuplicate = await checkDuplicateName(playerData.name, playerData.id);
          if (isDuplicate) {
            throw new Error('Já existe um jogador com este nome');
          }
        }
        
        player = { ...existingPlayer, ...playerData };
      } else {
        // Verifica se o jogador já existe antes de criar
        const isDuplicate = await checkDuplicateName(playerData.name || '');
        if (isDuplicate) {
          throw new Error('Já existe um jogador com este nome');
        }
        
        player = {
          id: uuidv4(),
          name: playerData.name || '',
          photoUrl: playerData.photoUrl,
          phone: playerData.phone,
          city: playerData.city,
          createdAt: now,
        };
      }
      
      // Log melhorado para verificação da URL do Storage
      if (player.photoUrl) {
        const isStorageUrl = player.photoUrl.includes('fotos/players');
        console.log(`🖼️ Player photo URL verification:`, {
          url: player.photoUrl.substring(0, 80) + (player.photoUrl.length > 80 ? '...' : ''),
          isFromStorage: isStorageUrl,
          bucket: 'fotos',
          folder: 'players'
        });
        
        if (isStorageUrl) {
          console.log('✅ Photo URL is correctly stored in Supabase Storage (fotos/players)');
        } else {
          console.log('ℹ️ Photo URL is not from Storage or using different path');
        }
      } else {
        console.log('📷 No photo URL provided - will save as NULL');
      }
      
      // Save player to database
      const id = await pokerDB.savePlayer(player);
      console.log("✅ Player saved successfully with ID:", id);
      
      // Log final verification
      if (player.photoUrl) {
        console.log("🔗 Final photo_url saved to database:", player.photoUrl);
      } else {
        console.log("🔗 photo_url saved as NULL to database");
      }
      
      // Update local state
      setPlayers(prev => {
        const index = prev.findIndex(p => p.id === id);
        if (index >= 0) {
          return [...prev.slice(0, index), player, ...prev.slice(index + 1)];
        }
        return [...prev, player];
      });
      
      return id;
    } catch (error) {
      console.error("❌ Error saving player:", error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const deletePlayer = async (id: string): Promise<void> => {
    try {
      // Get the player first to check for photo
      const player = await getPlayer(id);
      
      // If player has a photo in the 'fotos' bucket, delete it
      if (player && player.photoUrl && player.photoUrl.includes('fotos')) {
        await deleteImageFromStorage(player.photoUrl, 'fotos');
        console.log("🗑️ Deleted player photo:", player.photoUrl);
      }
      
      await pokerDB.deletePlayer(id);
      setPlayers(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("❌ Error deleting player:", error);
      toast({
        title: "Erro ao excluir jogador",
        description: "Não foi possível excluir o jogador",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    players,
    setPlayers,
    getPlayer,
    savePlayer,
    deletePlayer
  };
}
