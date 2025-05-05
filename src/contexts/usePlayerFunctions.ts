
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../lib/db/models';
import { pokerDB } from '../lib/db/database';

export function usePlayerFunctions() {
  const [players, setPlayers] = useState<Player[]>([]);

  const getPlayer = async (id: string) => {
    return await pokerDB.getPlayer(id);
  };

  const savePlayer = async (playerData: Partial<Player>) => {
    const now = new Date();
    let player: Player;
    
    if (playerData.id) {
      const existingPlayer = await pokerDB.getPlayer(playerData.id);
      if (!existingPlayer) {
        throw new Error('Player not found');
      }
      player = { ...existingPlayer, ...playerData };
    } else {
      player = {
        id: uuidv4(),
        name: playerData.name || 'Jogador sem nome',
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
