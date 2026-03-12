
import Dexie from 'dexie';
import { type Table } from 'dexie';
import { MediaItem, UserProfile } from './types';

// Use default import for Dexie to ensure that the class definition is correctly 
// inherited, allowing methods like .version() to be recognized by the TypeScript compiler on the VisionDB subclass.
export class VisionDB extends Dexie {
  watchlist!: Table<MediaItem>;
  user!: Table<UserProfile>;

  constructor() {
    super('VisionDB');
    
    // Define the database version and stores within the constructor.
    // This is the standard pattern for initializing a Dexie database in a TypeScript class.
    // Fixed: methods inherited from Dexie are now correctly typed through the default import.
    this.version(1).stores({
      watchlist: 'id, title, status, type, rating',
      user: '++id' // Store profile with an auto-incrementing primary key
    });
  }
}

export const db = new VisionDB();
