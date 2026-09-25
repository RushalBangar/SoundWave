export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumArt: string;
  duration: number; // in seconds
  audioUrl: string;
  genre: string;
  lyrics?: string[];
  plays?: number;
  addedAt?: string;
  accentColor?: string;
  source?: string;
  sourceUrl?: string;
  language?: 'Hindi' | 'Marathi' | 'English' | 'Regional';
  youtubeId?: string;
  youtubeUrl?: string;
  bpm?: number;
  key?: string;
  year?: string;
  mood?: string;
  artistHandle?: string;
  igReelsCount?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  monthlyListeners: number;
  verified: boolean;
  bio: string;
  popularTrackIds: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverArt: string;
  owner: string;
  isCustom?: boolean;
  trackIds: string[];
  gradientColor: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  iconBg: string;
  image: string;
}

export interface PairedDevice {
  id: string;
  name: string;
  type: 'computer' | 'smartphone' | 'tablet' | 'speaker';
  isCurrent: boolean;
  batteryLevel?: number;
  lastActive: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'playlist' | 'artist' | 'liked';
