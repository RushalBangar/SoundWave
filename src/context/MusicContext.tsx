import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Track, Playlist, Artist, Category, ViewType } from '../types/music';
import { TRACKS, ARTISTS, PLAYLISTS, CATEGORIES } from '../data/mockMusic';
import { SoundWaveAudioEngine } from '../audio/AudioEngine';
import { fetchTrendingTracks, fetchIndianRegionalTracks, searchAudiusTracks, searchAudiusArtists } from '../services/audiusApi';

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
  isAudiusConnected: boolean;

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
  refreshAudiusTrending: () => Promise<void>;
  audioEngine: SoundWaveAudioEngine;
}

const MusicContext = createContext<MusicContextType | null>(null);

const STORAGE_LIKED = 'soundwave_liked_tracks';
const STORAGE_CUSTOM_PLAYLISTS = 'soundwave_custom_playlists';

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseTracks, setBaseTracks] = useState<Track[]>(TRACKS);
  const [audiusTracks, setAudiusTracks] = useState<Track[]>([]);
  const [baseArtists, setBaseArtists] = useState<Artist[]>(ARTISTS);
  const [audiusArtists, setAudiusArtists] = useState<Artist[]>([]);

  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isAudiusConnected, setIsAudiusConnected] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<Track[]>([]);
  const [liveArtistResults, setLiveArtistResults] = useState<Artist[]>([]);

  // Combined tracks: Audius trending first, then base tracks
  const tracks = useMemo(() => {
    return audiusTracks.length > 0 ? [...audiusTracks, ...baseTracks] : baseTracks;
  }, [audiusTracks, baseTracks]);

  const artists = useMemo(() => {
    return audiusArtists.length > 0 ? [...audiusArtists, ...baseArtists] : baseArtists;
  }, [audiusArtists, baseArtists]);

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
    if (audiusTracks.length > 0) {
      list.unshift({
        id: 'pl-audius-trending',
        title: 'Audius Global Trending',
        description: 'Live top streaming tracks powered by the decentralized Audius Music Network.',
        coverArt: audiusTracks[0]?.albumArt || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        owner: 'Audius Official',
        gradientColor: 'from-[#a855f7]/40 to-[#090d16]',
        trackIds: audiusTracks.slice(0, 15).map(t => t.id)
      });
    }
    return [...list, ...customPlaylists];
  }, [audiusTracks, customPlaylists]);

  const categories = useMemo(() => CATEGORIES, []);

  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(TRACKS[0].duration || 180);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>(TRACKS);

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIKED);
      return saved ? JSON.parse(saved) : ['track-1', 'track-2', 'track-7'];
    } catch {
      return ['track-1', 'track-2'];
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

  // Fetch Audius trending & Indian regional tracks on initial launch
  const loadAudiusMusic = async () => {
    setIsLoadingLive(true);
    try {
      const [trending, indianTracks] = await Promise.all([
        fetchTrendingTracks(undefined, 20),
        fetchIndianRegionalTracks(15)
      ]);

      const combinedLive = [...indianTracks, ...trending];
      const seen = new Set<string>();
      const deduped: Track[] = [];
      for (const t of combinedLive) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          deduped.push(t);
        }
      }

      if (deduped.length > 0) {
        setAudiusTracks(deduped);
        setIsAudiusConnected(true);
        setQueue(prev => [...deduped, ...prev]);

        // Extract unique artists
        const uniqueArtists: Artist[] = [];
        const artistSeen = new Set<string>();
        for (const t of deduped) {
          if (!artistSeen.has(t.artistId)) {
            artistSeen.add(t.artistId);
            uniqueArtists.push({
              id: t.artistId,
              name: t.artist,
              avatar: t.albumArt,
              coverImage: t.albumArt,
              monthlyListeners: (t.plays || 5000) * 12,
              verified: true,
              bio: `Artist on the Audius network. Stream their tracks on SoundWave.`,
              popularTrackIds: [t.id]
            });
          }
        }
        setAudiusArtists(uniqueArtists);
      }
    } catch (e) {
      console.warn('Audius trending load failed, base tracks active:', e);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    loadAudiusMusic();
  }, []);

  // Live Audius Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setLiveArtistResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingLive(true);
      try {
        const [trackRes, artistRes] = await Promise.all([
          searchAudiusTracks(searchQuery, 15),
          searchAudiusArtists(searchQuery, 6)
        ]);
        setLiveSearchResults(trackRes);
        setLiveArtistResults(artistRes);
      } catch (err) {
        console.warn('Live search error:', err);
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
    let nextIndex: number;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (nextIndex === currentIndex && queue.length > 1) {
        nextIndex = (currentIndex + 1) % queue.length;
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          audioEngine.pause();
          setIsPlaying(false);
          return;
        }
      }
    }

    const nextTrack = queue[nextIndex];
    playTrack(nextTrack);
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const setPlayerVolume = (vol: number) => {
    setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const toggleLike = (trackId: string) => {
    setLikedTrackIds(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const isLiked = (trackId: string) => {
    return likedTrackIds.includes(trackId);
  };

  const navigateTo = (view: ViewType, options?: { playlistId?: string; artistId?: string }) => {
    const newState: NavState = {
      view,
      playlistId: options?.playlistId,
      artistId: options?.artistId
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const createPlaylist = (title: string, description: string): Playlist => {
    const newPl: Playlist = {
      id: 'custom-' + Date.now(),
      title,
      description: description || 'Created on SoundWave Web',
      coverArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop&q=80',
      owner: 'You',
      isCustom: true,
      trackIds: [],
      gradientColor: 'from-[#00F0FF]/30 to-[#090d16]'
    };
    setCustomPlaylists(prev => [newPl, ...prev]);
    return newPl;
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
        canGoBack: historyIndex > 0,
        canGoForward: historyIndex < history.length - 1,
        isLoadingLive,
        liveSearchResults,
        liveArtistResults,
        isAudiusConnected,

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
        refreshAudiusTrending: loadAudiusMusic,
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
