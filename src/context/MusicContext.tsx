import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Track, Playlist, Artist, Category, ViewType } from '../types/music';
import { TRACKS, ARTISTS, PLAYLISTS, CATEGORIES } from '../data/mockMusic';
import { SoundWaveAudioEngine } from '../audio/AudioEngine';
import { 
  searchYouTubeTracks, 
  getYouTubeTrackFromIdOrUrl, 
  fetchTrendingYouTubeTracks, 
  fetchBollywoodYouTubeTracks, 
  fetchMarathiYouTubeTracks 
} from '../services/youtubeApi';

export type LanguageFilter = 'all' | 'Hindi' | 'Marathi' | 'English';

interface MusicContextType {
  tracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
  categories: Category[];
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  likedTrackIds: string[];
  currentView: ViewType;
  selectedPlaylistId: string | null;
  selectedArtistId: string | null;
  selectedLanguageFilter: LanguageFilter;
  setSelectedLanguageFilter: (filter: LanguageFilter) => void;
  searchQuery: string;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isRightSidebarOpen: boolean;
  isVisualizerActive: boolean;
  frequencyData: Uint8Array;
  isYouTubeVideoOpen: boolean;
  setIsYouTubeVideoOpen: (open: boolean) => void;
  syncTimeUpdate: (currentTime: number, duration: number) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoadingLive: boolean;
  liveSearchResults: Track[];
  liveArtistResults: Artist[];
  isAudiusConnected: boolean; // Retained for backwards compatibility
  isYouTubeConnected: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => void;
  setPlayerVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  navigateTo: (view: ViewType, options?: { playlistId?: string; artistId?: string }) => void;
  goBack: () => void;
  goForward: () => void;
  setSearchQuery: (query: string) => void;
  setIsLyricsOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsRightSidebarOpen: (open: boolean) => void;
  setIsVisualizerActive: (active: boolean) => void;
  createPlaylist: (title: string, description: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  refreshAudiusTrending: () => Promise<void>; // Alias for YouTube refresh
  refreshYouTubeTrending: () => Promise<void>;
  addCustomYouTubeTrack: (urlOrId: string) => Promise<Track | null>;
  audioEngine: SoundWaveAudioEngine;
}

const MusicContext = createContext<MusicContextType | null>(null);

const STORAGE_LIKED = 'soundwave_liked_tracks';
const STORAGE_CUSTOM_PLAYLISTS = 'soundwave_custom_playlists';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseTracks, setBaseTracks] = useState<Track[]>(TRACKS);
  const [youtubeLiveTracks, setYoutubeLiveTracks] = useState<Track[]>([]);
  const [baseArtists, setBaseArtists] = useState<Artist[]>(ARTISTS);
  const [youtubeArtists, setYoutubeArtists] = useState<Artist[]>([]);

  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(true);
  const [liveSearchResults, setLiveSearchResults] = useState<Track[]>([]);
  const [liveArtistResults, setLiveArtistResults] = useState<Artist[]>([]);

  // Combined YouTube Catalog: Live trending tracks first, then predefined tracks
  const tracks = useMemo(() => {
    if (youtubeLiveTracks.length === 0) return baseTracks;
    const seen = new Set<string>();
    const merged: Track[] = [];

    for (const t of youtubeLiveTracks) {
      if (!seen.has(t.youtubeId || t.id)) {
        seen.add(t.youtubeId || t.id);
        merged.push(t);
      }
    }

    for (const t of baseTracks) {
      if (!seen.has(t.youtubeId || t.id)) {
        seen.add(t.youtubeId || t.id);
        merged.push(t);
      }
    }

    return merged;
  }, [youtubeLiveTracks, baseTracks]);

  const artists = useMemo(() => {
    return youtubeArtists.length > 0 ? [...youtubeArtists, ...baseArtists] : baseArtists;
  }, [youtubeArtists, baseArtists]);

  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PLAYLISTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const playlists = useMemo(() => {
    const list = [...PLAYLISTS];
    if (youtubeLiveTracks.length > 0) {
      list.unshift({
        id: 'pl-yt-trending',
        title: 'Global Trending Hits',
        description: 'Real-time top streaming songs and chart-topping releases in lossless fidelity.',
        coverArt: youtubeLiveTracks[0]?.albumArt || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        owner: 'SoundWave Editorial',
        gradientColor: 'from-[#00F0FF]/40 to-[#090d16]',
        trackIds: youtubeLiveTracks.slice(0, 15).map(t => t.id)
      });
    }
    return [...list, ...customPlaylists];
  }, [youtubeLiveTracks, customPlaylists]);

  const categories = useMemo(() => CATEGORIES, []);

  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(TRACKS[0].duration || 268);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>(TRACKS);

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIKED);
      return saved ? JSON.parse(saved) : ['track-hindi-1', 'track-marathi-1', 'track-1'];
    } catch {
      return ['track-hindi-1', 'track-marathi-1'];
    }
  });

  // Navigation History Stack
  interface NavState {
    view: ViewType;
    playlistId?: string;
    artistId?: string;
  }

  const [history, setHistory] = useState<NavState[]>([{ view: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const currentNav = history[historyIndex] || { view: 'home' };
  const currentView = currentNav.view;
  const selectedPlaylistId = currentNav.playlistId || null;
  const selectedArtistId = currentNav.artistId || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const [isYouTubeVideoOpen, setIsYouTubeVideoOpen] = useState(false);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<LanguageFilter>('all');
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32));

  const syncTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time);
    if (dur && isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  // Audio Engine Singleton
  const audioEngineRef = useRef<SoundWaveAudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new SoundWaveAudioEngine();
  }
  const audioEngine = audioEngineRef.current;

  // Fetch YouTube trending on startup
  const loadYouTubeMusic = async () => {
    setIsLoadingLive(true);
    try {
      const [bollywood, marathi, trending] = await Promise.all([
        fetchBollywoodYouTubeTracks(10),
        fetchMarathiYouTubeTracks(10),
        fetchTrendingYouTubeTracks('trending songs 2026', 10)
      ]);

      const merged = [...bollywood, ...marathi, ...trending];
      const seen = new Set<string>();
      const deduped: Track[] = [];

      for (const t of merged) {
        if (!seen.has(t.youtubeId || t.id)) {
          seen.add(t.youtubeId || t.id);
          deduped.push(t);
        }
      }

      if (deduped.length > 0) {
        setYoutubeLiveTracks(deduped);
        setIsYouTubeConnected(true);

        // Derive artist profiles from YouTube channels
        const artistMap = new Map<string, Artist>();
        for (const t of deduped) {
          if (!artistMap.has(t.artist)) {
            artistMap.set(t.artist, {
              id: t.artistId,
              name: t.artist,
              avatar: t.albumArt,
              coverImage: t.albumArt,
              monthlyListeners: (t.plays || 100000) * 8,
              verified: true,
              bio: `Featured artist • Stream all their tracks on SoundWave.`,
              popularTrackIds: [t.id]
            });
          }
        }
        setYoutubeArtists(Array.from(artistMap.values()));
      }
    } catch (e) {
      console.warn('YouTube live trending load failed, predefined catalog active:', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    loadYouTubeMusic();
  }, []);

  // Live YouTube Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setLiveArtistResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingLive(true);
      try {
        const results = await searchYouTubeTracks(searchQuery, 20);
        setLiveSearchResults(results);

        // Extract artists from search results
        const artistMap = new Map<string, Artist>();
        for (const t of results) {
          if (!artistMap.has(t.artist)) {
            artistMap.set(t.artist, {
              id: t.artistId,
              name: t.artist,
              avatar: t.albumArt,
              coverImage: t.albumArt,
              monthlyListeners: (t.plays || 500000),
              verified: true,
              bio: `Featured Artist • ${t.artist}`,
              popularTrackIds: [t.id]
            });
          }
        }
        setLiveArtistResults(Array.from(artistMap.values()).slice(0, 6));
      } catch (err) {
        console.warn('Live YouTube search error:', err);
      } finally {
        setIsLoadingLive(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Persist liked tracks safely
  useEffect(() => {
    try {
      const cleanIds = likedTrackIds.filter(id => typeof id === 'string');
      localStorage.setItem(STORAGE_LIKED, JSON.stringify(cleanIds));
    } catch (e) {
      console.warn('Failed to save liked tracks to localStorage', e);
    }
  }, [likedTrackIds]);

  // Persist custom playlists safely
  useEffect(() => {
    try {
      const cleanPlaylists = customPlaylists.map(p => ({
        id: String(p.id),
        title: String(p.title),
        description: String(p.description),
        coverArt: String(p.coverArt),
        owner: String(p.owner),
        isCustom: true,
        trackIds: Array.isArray(p.trackIds) ? p.trackIds.filter(id => typeof id === 'string') : [],
        gradientColor: String(p.gradientColor || 'from-[#00F0FF]/30 to-[#090d16]')
      }));
      localStorage.setItem(STORAGE_CUSTOM_PLAYLISTS, JSON.stringify(cleanPlaylists));
    } catch (e) {
      console.warn('Failed to save playlists to localStorage', e);
    }
  }, [customPlaylists]);

  // Configure Audio Engine Callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onTimeUpdate: (time, dur) => {
        setCurrentTime(time);
        if (dur && isFinite(dur)) setDuration(dur);
      },
      onPlayStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onEnded: () => {
        handleTrackEnded();
      }
    });

    audioEngine.loadTrack(currentTrack.audioUrl, currentTrack.duration, currentTrack.genre, currentTrack.bpm);
    audioEngine.setVolume(volume);
  }, []);

  // Update volume
  useEffect(() => {
    if (isMuted) {
      audioEngine.setVolume(0);
    } else {
      audioEngine.setVolume(volume);
    }
  }, [volume, isMuted]);

  // Frequency polling for equalizer
  useEffect(() => {
    let animId: number;
    const updateFreq = () => {
      if (isPlaying) {
        setFrequencyData(audioEngine.getFrequencyData());
      }
      animId = requestAnimationFrame(updateFreq);
    };
    animId = requestAnimationFrame(updateFreq);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.play();
    } else {
      playNext();
    }
  };

  const playTrack = (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);
    if (newQueue) {
      setQueue(newQueue);
    }
    audioEngine.loadTrack(track.audioUrl, track.duration, track.genre, track.bpm);
    audioEngine.play();
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let nextIndex = 0;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentIndex < queue.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (repeatMode === 'all') {
      nextIndex = 0;
    } else {
      return;
    }

    playTrack(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      audioEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let prevIndex = queue.length - 1;

    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }

    playTrack(queue[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const setPlayerVolume = (vol: number) => {
    setVolume(vol);
    if (isMuted && vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLike = (trackId: string) => {
    setLikedTrackIds(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const isLiked = (trackId: string): boolean => {
    return likedTrackIds.includes(trackId);
  };

  const navigateTo = (view: ViewType, options?: { playlistId?: string; artistId?: string }) => {
    const nextState: NavState = {
      view,
      playlistId: options?.playlistId,
      artistId: options?.artistId
    };

    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, nextState];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const goBack = () => {
    if (canGoBack) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  const createPlaylist = (title: string, description: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `custom-pl-${Date.now()}`,
      title,
      description,
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      owner: 'You',
      gradientColor: 'from-[#00F0FF]/30 to-[#090d16]',
      isCustom: true,
      trackIds: []
    };

    setCustomPlaylists(prev => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setCustomPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setCustomPlaylists(prev =>
      prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        return p;
      })
    );
  };

  const addCustomYouTubeTrack = async (urlOrId: string): Promise<Track | null> => {
    const track = await getYouTubeTrackFromIdOrUrl(urlOrId);
    if (track) {
      setBaseTracks(prev => [track, ...prev]);
      playTrack(track);
      return track;
    }
    return null;
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        artists,
        playlists,
        categories,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        likedTrackIds,
        currentView,
        selectedPlaylistId,
        selectedArtistId,
        selectedLanguageFilter,
        setSelectedLanguageFilter,
        searchQuery,
        isLyricsOpen,
        isQueueOpen,
        isRightSidebarOpen,
        isVisualizerActive,
        frequencyData,
        isYouTubeVideoOpen,
        setIsYouTubeVideoOpen,
        syncTimeUpdate,
        canGoBack,
        canGoForward,
        isLoadingLive,
        liveSearchResults,
        liveArtistResults,
        isAudiusConnected: isYouTubeConnected,
        isYouTubeConnected,

        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setPlayerVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        isLiked,
        navigateTo,
        goBack,
        goForward,
        setSearchQuery,
        setIsLyricsOpen,
        setIsQueueOpen,
        setIsRightSidebarOpen,
        setIsVisualizerActive,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        refreshAudiusTrending: loadYouTubeMusic,
        refreshYouTubeTrending: loadYouTubeMusic,
        addCustomYouTubeTrack,
        audioEngine
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
