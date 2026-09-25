import React, { useMemo } from 'react';
import { Play, Pause, Heart, Sparkles, ChevronRight, Radio, RefreshCw, Flame } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track, Playlist } from '../../types/music';

export const HomeView: React.FC = () => {
  const {
    playlists,
    artists,
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    navigateTo,
    likedTrackIds,
    isAudiusConnected,
    isLoadingLive,
    refreshAudiusTrending,
    selectedLanguageFilter,
    setSelectedLanguageFilter,
    setIsYouTubeVideoOpen
  } = useMusic();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filtered tracks based on language chip
  const hindiTracks = useMemo(() => {
    return tracks.filter(t => t.language === 'Hindi');
  }, [tracks]);

  const marathiTracks = useMemo(() => {
    return tracks.filter(t => t.language === 'Marathi');
  }, [tracks]);

  const youtubeTrendingTracks = useMemo(() => {
    return tracks.filter(t => t.id.startsWith('yt-') || Boolean(t.youtubeId)).slice(0, 10);
  }, [tracks]);

  const displayTracks = useMemo(() => {
    if (selectedLanguageFilter === 'Hindi') return hindiTracks;
    if (selectedLanguageFilter === 'Marathi') return marathiTracks;
    if (selectedLanguageFilter === 'English') return tracks.filter(t => t.language === 'English');
    return tracks;
  }, [selectedLanguageFilter, tracks, hindiTracks, marathiTracks]);

  const displayPlaylists = useMemo(() => {
    if (selectedLanguageFilter === 'Hindi') {
      return playlists.filter(p => p.id.includes('hindi'));
    }
    if (selectedLanguageFilter === 'Marathi') {
      return playlists.filter(p => p.id.includes('marathi'));
    }
    return playlists;
  }, [selectedLanguageFilter, playlists]);

  const displayArtists = useMemo(() => {
    if (selectedLanguageFilter === 'Hindi') {
      return artists.filter(a => a.id.includes('hindi'));
    }
    if (selectedLanguageFilter === 'Marathi') {
      return artists.filter(a => a.id.includes('marathi'));
    }
    return artists;
  }, [selectedLanguageFilter, artists]);

  const quickTiles = useMemo(() => {
    return [
      {
        id: 'liked-tile',
        title: 'Liked Songs',
        type: 'liked' as const,
        coverArt: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80',
        tracks: tracks.filter(t => likedTrackIds.includes(t.id))
      },
      ...displayPlaylists.slice(0, 5).map(p => ({
        id: p.id,
        title: p.title,
        type: 'playlist' as const,
        coverArt: p.coverArt,
        tracks: tracks.filter(t => p.trackIds.includes(t.id))
      }))
    ];
  }, [displayPlaylists, tracks, likedTrackIds]);

  const handleTilePlay = (e: React.MouseEvent, tileTracks: Track[]) => {
    e.stopPropagation();
    if (tileTracks.length === 0) return;
    const isCurrentInTile = tileTracks.some(t => t.id === currentTrack.id);
    if (isCurrentInTile) {
      togglePlayPause();
    } else {
      playTrack(tileTracks[0], tileTracks);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Greeting & Language Filter Tabs */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {greeting}
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              SoundWave Hi-Fi
            </span>
          </div>
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedLanguageFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
              selectedLanguageFilter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            All Music
          </button>
          <button
            onClick={() => setSelectedLanguageFilter('Hindi')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              selectedLanguageFilter === 'Hindi'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-slate-800/80 text-orange-300 hover:text-orange-200 hover:bg-slate-700'
            }`}
          >
            <span>🇮🇳</span>
            <span>Bollywood & Hindi</span>
          </button>
          <button
            onClick={() => setSelectedLanguageFilter('Marathi')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              selectedLanguageFilter === 'Marathi'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800/80 text-rose-300 hover:text-rose-200 hover:bg-slate-700'
            }`}
          >
            <span>🚩</span>
            <span>Marathi Maati</span>
          </button>
          <button
            onClick={() => setSelectedLanguageFilter('English')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
              selectedLanguageFilter === 'English'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Global / English
          </button>
        </div>

        {/* 6 Quick Grid Tiles (Spotify Signature Home Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickTiles.map((tile) => {
            const isPlayingThisTile =
              isPlaying && tile.tracks.some(t => t.id === currentTrack.id);

            return (
              <div
                key={tile.id}
                onClick={() => {
                  if (tile.type === 'liked') navigateTo('liked');
                  else navigateTo('playlist', { playlistId: tile.id });
                }}
                className="group relative flex items-center bg-[#151d2e]/80 hover:bg-[#1f2b42] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer border border-slate-800/80 shadow-md"
              >
                <div className="w-16 h-16 shrink-0 relative">
                  {tile.type === 'liked' ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-cyan-600 to-sky-400 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-white fill-white" />
                    </div>
                  ) : (
                    <img
                      src={tile.coverArt}
                      alt={tile.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 px-4 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {tile.title}
                  </p>
                </div>

                {/* Circular Hover Play Button */}
                <button
                  onClick={(e) => handleTilePlay(e, tile.tracks)}
                  className={`mr-4 w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-500/40 transition-all duration-200 ${
                    isPlayingThisTile
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
                  }`}
                  title="Play"
                >
                  {isPlayingThisTile ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- BOLLYWOOD & HINDI SPOTLIGHT SECTION --- */}
      {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'Hindi') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Bollywood & Hindi Hits
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  🇮🇳 Hindi
                </span>
              </div>
              <p className="text-xs text-slate-400">Romantic acoustic melodies, Sufi chords, and Hindi Lo-Fi</p>
            </div>
            <button
              onClick={() => setSelectedLanguageFilter('Hindi')}
              className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
            >
              See Hindi tracks
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {hindiTracks.map((track) => {
              const isThisPlaying = isPlaying && currentTrack.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, hindiTracks)}
                  className="group relative p-3 bg-[#131b2c] hover:bg-[#1c273e] rounded-xl transition duration-200 cursor-pointer border border-orange-900/30 hover:border-orange-500/40 shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2.5 shadow-md">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isThisPlaying) togglePlayPause();
                        else playTrack(track, hindiTracks);
                      }}
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-orange-400 text-black flex items-center justify-center shadow-xl shadow-orange-500/40 transition-all duration-200 ${
                        isThisPlaying
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-white truncate group-hover:text-orange-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- MARATHI MAATI & REGIONAL SPOTLIGHT SECTION --- */}
      {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'Marathi') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Marathi Maati & Regional Hits
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  🚩 मराठी
                </span>
              </div>
              <p className="text-xs text-slate-400">Ajay-Atul Dhol Tasha, Zingaat, Sairat, Lavani & Varkari Abhang</p>
            </div>
            <button
              onClick={() => setSelectedLanguageFilter('Marathi')}
              className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
            >
              See Marathi tracks
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {marathiTracks.map((track) => {
              const isThisPlaying = isPlaying && currentTrack.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, marathiTracks)}
                  className="group relative p-3 bg-[#131b2c] hover:bg-[#1c273e] rounded-xl transition duration-200 cursor-pointer border border-rose-900/30 hover:border-rose-500/40 shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2.5 shadow-md">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isThisPlaying) togglePlayPause();
                        else playTrack(track, marathiTracks);
                      }}
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 transition-all duration-200 ${
                        isThisPlaying
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-white truncate group-hover:text-rose-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Live Trending Section */}
      {selectedLanguageFilter === 'all' && youtubeTrendingTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Trending Now
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-cyan-400" />
                  Top Hits
                </span>
              </div>
              <p className="text-xs text-slate-400">Stream top trending releases and chart-toppers</p>
            </div>
            <button
              onClick={() => refreshAudiusTrending()}
              disabled={isLoadingLive}
              className="text-xs font-bold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {youtubeTrendingTracks.map((track) => {
              const isThisPlaying = isPlaying && currentTrack.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, youtubeTrendingTracks)}
                  className="group relative p-3 bg-[#121826] hover:bg-[#1a2236] rounded-xl transition duration-200 cursor-pointer border border-slate-800/60 hover:border-cyan-500/40 shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2.5 shadow-md">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isThisPlaying) togglePlayPause();
                        else playTrack(track, youtubeTrendingTracks);
                      }}
                      className={`absolute bottom-2 right-2 w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 transition-all duration-200 ${
                        isThisPlaying
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Featured Playlists
            </h2>
            <p className="text-xs text-slate-400">Curated collections for every emotion and mood</p>
          </div>
          <button 
            onClick={() => navigateTo('search')}
            className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
          >
            Show all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayPlaylists.map((pl) => {
            const plTracks = tracks.filter(t => pl.trackIds.includes(t.id));
            const isPlayingThisPl = isPlaying && plTracks.some(t => t.id === currentTrack.id);

            return (
              <div
                key={pl.id}
                onClick={() => navigateTo('playlist', { playlistId: pl.id })}
                className="group relative p-3.5 bg-[#121826] hover:bg-[#1a2236] rounded-xl transition duration-200 cursor-pointer border border-slate-800/60 shadow-lg flex flex-col"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 shadow-md">
                  <img
                    src={pl.coverArt}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover Floating Play Button */}
                  <button
                    onClick={(e) => handleTilePlay(e, plTracks)}
                    className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 transition-all duration-200 ${
                      isPlayingThisPl
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'
                    }`}
                    title="Play"
                  >
                    {isPlayingThisPl ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                  {pl.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {pl.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Featured Artists
            </h2>
            <p className="text-xs text-slate-400">Discover trending Indian & Global creators</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayArtists.slice(0, 6).map((artist) => (
            <div
              key={artist.id}
              onClick={() => navigateTo('artist', { artistId: artist.id })}
              className="group p-3.5 bg-[#121826] hover:bg-[#1a2236] rounded-xl transition duration-200 cursor-pointer border border-slate-800/60 shadow-lg flex flex-col items-center text-center"
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 shadow-md border-2 border-slate-700/50 group-hover:border-cyan-400 transition-colors">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-sm text-white truncate w-full group-hover:text-cyan-300 transition-colors">
                {artist.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Artist</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
