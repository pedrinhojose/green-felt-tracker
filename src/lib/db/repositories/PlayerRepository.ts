
import { IDBPDatabase } from 'idb';
import { Player } from '../models';
import { PokerDB } from '../schema/PokerDBSchema';

export class PlayerRepository {
  constructor(private db: Promise<IDBPDatabase<PokerDB>>) {}

  async getPlayers(): Promise<Player[]> {
    return (await this.db).getAll('players');
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return (await this.db).get('players', id);
  }

  async savePlayer(player: Player): Promise<string> {
    await (await this.db).put('players', player);
    return player.id;
  }

  async deletePlayer(id: string): Promise<void> {
    await (await this.db).delete('players', id);
  }
}
