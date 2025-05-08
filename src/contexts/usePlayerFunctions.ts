
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../lib/db/models';
import { pokerDB } from '../lib/db';

export function usePlayerFunctions() {
  const [players, setPlayers] = useState<Player[]>([]);

  const getPlayer = async (id: string) => {
    return await pokerDB.getPlayer(id);
  };
  
  // Função para normalizar nomes (remover espaços extras e padronizar capitalização)
  const normalizeName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ');
  };
  
  // Função para verificar se já existe um jogador com o mesmo nome
  const checkDuplicateName = async (name: string, excludeId?: string): Promise<boolean> => {
    const allPlayers = await pokerDB.getPlayers();
    const normalizedName = normalizeName(name).toLowerCase();
    
    return allPlayers.some(player => 
      player.name.toLowerCase() === normalizedName && 
      player.id !== excludeId
    );
  };

  const savePlayer = async (playerData: Partial<Player>) => {
    const now = new Date();
    let player: Player;
    
    // Normaliza o nome
    if (playerData.name) {
      playerData.name = normalizeName(playerData.name);
    }
    
    // Verifica se é uma atualização ou criação
    if (playerData.id) {
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
      if (!playerData.name || playerData.name.trim() === '') {
        throw new Error('Nome do jogador é obrigatório');
      }
      
      const isDuplicate = await checkDuplicateName(playerData.name);
      if (isDuplicate) {
        throw new Error('Já existe um jogador com este nome');
      }
      
      player = {
        id: uuidv4(),
        name: playerData.name,
        photoUrl: playerData.photoUrl,
        phone: playerData.phone,
        city: playerData.city,
        createdAt: now,
      };
    }
    
    const id = await pokerDB.savePlayer(player);
    
    // Update local state
    setPlayers(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index >= 0) {
        return [...prev.slice(0, index), player, ...prev.slice(index + 1)];
      }
      return [...prev, player];
    });
    
    return id;
  };

  const deletePlayer = async (id: string) => {
    await pokerDB.deletePlayer(id);
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  return {
    players,
    setPlayers,
    getPlayer,
    savePlayer,
    deletePlayer
  };
}
