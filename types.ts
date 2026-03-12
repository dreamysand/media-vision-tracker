
export type MediaStatus = 'Ongoing' | 'Completed' | 'Dropped' | 'Watching';

export interface MediaItem {
  id: string;
  title: string;
  type: 'Movie' | 'Series' | 'Anime' | 'Anime Movie';
  status: MediaStatus;
  year: number;
  duration?: string;
  rating: number; 
  genres: string[];
  synopsis: string;
  notes: string;
  image: string;
  progress?: {
    current: number;
    total: number;
  };
  lastUpdated: string;
  quality?: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
}

export type ViewState = 'home' | 'detail' | 'add' | 'search' | 'profile' | 'edit-profile' | 'watched-list';

export interface AppState {
  view: ViewState;
  selectedId: string | null;
  watchlist: MediaItem[];
  user: UserProfile;
  activeFilter?: string;
}
