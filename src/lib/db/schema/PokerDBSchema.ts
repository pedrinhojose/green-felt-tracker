
import { DBSchema } from 'idb';
import { Player, Season, Game, RankingEntry, ClubFundTransaction } from '../models';

export interface PokerDB extends DBSchema {
  players: {
    key: string;
    value: Player;
    indexes: { 'by-name': string };
  };
  seasons: {
    key: string;
    value: Season;
    indexes: { 'by-active': number }; // Changed to number (0/1) instead of boolean
  };
  games: {
    key: string;
    value: Game;
    indexes: { 'by-season': string; 'by-date': Date };
  };
  rankings: {
    key: string;
    value: RankingEntry;
    indexes: { 'by-season': string; 'by-points': number };
  };
  clubFundTransactions: {
    key: string;
    value: ClubFundTransaction;
    indexes: { 'by-season': string; 'by-date': Date; 'by-type': string };
  };
}
