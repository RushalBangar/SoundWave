import React, { useMemo, useState } from 'react';
import { Search, Play, Pause, Heart, Loader2, Plus, Sparkles, Music } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    tracks,
    artists,
    playlists,
    categories,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    navigateTo,
    isLiked,
    toggleLike,
    isLoadingLive,
    liveSearchResults,
    liveArtistResults,
    addCustomYouTubeTrack
  } = useMusic();

  const [directInput, setDirectInput] = useState('');
  const [isResolvingDirect, setIsResolvingDirect] = useState(false);
  const [directError, setDirectError] = useState('');

  const query = searchQuery.trim().toLowerCase();

  const quickSearchTags = [
    { label: '🇮🇳 Bollywood & Hindi', query: 'Hindi Hit Songs' },
    { label: '🚩 Marathi Maati', query: 'Marathi Songs' },
    { label: '🥁 Zingaat & Dhol Tasha', query: 'Zingaat Sairat' },
    { label: '🙏 Mauli Mauli & Abhang', query: 'Mauli Mauli' },
    { label: '☕ Hindi Lo-Fi & Chill', query: 'Hindi Lo-Fi Songs' },
    { label: '🎤 Arijit Singh', query: 'Arijit Singh' },
    { label: '💃 Apsara Aali Lavani', query: 'Apsara Aali' },
    { label: '🌟 The Weeknd', query: 'The Weeknd' }
  ];

  // Merge live search results with catalog tracks
  const combinedTracks = useMemo(() => {
    if (!query) return [];
    const localMatches = tracks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query) ||
      (t.language && t.language.toLowerCase().includes(query))
    );

    const merged = [...liveSearchResults];
    const seenIds = new Set(liveSearchResults.map(t => t.youtubeId || t.id));

    for (const t of localMatches) {
      if (!seenIds.has(t.youtubeId || t.id)) {
        merged.push(t);
        seenIds.add(t.youtubeId || t.id);
      }
    }
    return merged;
  }, [query, tracks, liveSearchResults]);

  const combinedArtists = useMemo(() => {
    if (!query) return [];
    const local = artists.filter(a => a.name.toLowerCase().includes(query));
    const merged = [...liveArtistResults];
    const seen = new Set(liveArtistResults.map(a => a.name.toLowerCase()));
    for (const a of local) {
      if (!seen.has(a.name.toLowerCase())) {
        merged.push(a);
        seen.add(a.name.toLowerCase());
      }
    }
    return merged;
  }, [query, artists, liveArtistResults]);

  const filteredPlaylists = playlists.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  const topResult = combinedTracks[0] || null;

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim()) return;

    setIsResolvingDirect(true);
    setDirectError('');

    try {
      const track = await addCustomYouTubeTrack(directInput.trim());
      if (track) {
        setDirectInput('');
      } else {
        setDirectError('Could not find song. Please check the song link or ID.');
      }
    } catch {
      setDirectError('Network error streaming track.');
    } finally {
      setIsResolvingDirect(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Direct Link or ID Fast Loader */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#151c2e] to-[#151c2e] border border-slate-700/60 shadow-lg">
        <form onSubmit={handleDirectSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Play Any Song by Link:</span>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={directInput}
              onChange={(e) => setDirectInput(e.target.value)}
              placeholder="Paste song link or share URL..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isResolvingDirect}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 text-black font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            {isResolvingDirect ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Stream Song</span>
          </button>
        </form>
        {directError && <p className="text-[11px] text-red-400 mt-1.5">{directError}</p>}
      </div>

      {/* Quick Search Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-semibold shrink-0 mr-1">Trending:</span>
        {quickSearchTags.map((tag) => (
          <button
            key={tag.query}
            onClick={() => setSearchQuery(tag.query)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 border ${
              query === tag.query.toLowerCase()
                ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* If No Query: Show Spotify-style "Browse All" Genres Grid */}
      {!query ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Browse all
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.name)}
                className={`group relative overflow-hidden rounded-xl p-4 h-36 ${cat.color} cursor-pointer transition hover:scale-[1.02] shadow-lg`}
              >
                <h3 className="font-extrabold text-lg text-white tracking-tight max-w-[120px] leading-tight">
                  {cat.name}
                </h3>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute -bottom-2 -right-3 w-20 h-20 rotate-[25deg] rounded-md shadow-2xl object-cover transition-transform group-hover:scale-110 group-hover:rotate-[20deg]"
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* If Has Query: Show Live Results */
        <div className="space-y-8">
          {isLoadingLive && (
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 animate-pulse py-1">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Searching music library...</span>
            </div>
          )}

          {/* Top Result + Songs List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Result Card */}
            {topResult && (
              <div className="lg:col-span-5 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-3">Top result</h3>
                <div
                  onClick={() => playTrack(topResult, combinedTracks)}
                  className="group relative flex-1 p-5 rounded-2xl bg-[#131b2c] hover:bg-[#1a253c] transition duration-300 cursor-pointer border border-slate-800 hover:border-cyan-500/40 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-2xl mb-4">
                      <img
                        src={topResult.albumArt}
                        alt={topResult.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {topResult.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{topResult.artist}</span>
                      <span>•</span>
                      <span className="text-slate-400">{topResult.album}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying && currentTrack.id === topResult.id) togglePlayPause();
                      else playTrack(topResult, combinedTracks);
                    }}
                    className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200 hover:scale-105"
                  >
                    {isPlaying && currentTrack.id === topResult.id ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Songs List */}
            <div className={`${topResult ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Songs</h3>
                <span className="text-xs text-slate-400">
                  {combinedTracks.length} tracks found
                </span>
              </div>
              <div className="space-y-1">
                {combinedTracks.slice(0, 10).map((track) => {
                  const isThisPlaying = isPlaying && currentTrack.id === track.id;
                  const liked = isLiked(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, combinedTracks)}
                      className={`group flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                        currentTrack.id === track.id
                          ? 'bg-slate-800 text-cyan-400'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 shadow">
                          <img
                            src={track.albumArt}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                            ) : (
                              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400 translate-x-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${currentTrack.id === track.id ? 'text-cyan-400' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1.5 transition ${liked ? 'text-cyan-400' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                        >
                          <Heart className={`w-4 h-4 ${liked ? 'fill-cyan-400' : ''}`} />
                        </button>
                        <span className="text-xs text-slate-400 font-mono w-9 text-right">
                          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Artists Matching Search */}
          {combinedArtists.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-white mb-3">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {combinedArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => navigateTo('artist', { artistId: artist.id })}
                    className="group p-3.5 bg-[#121826] hover:bg-[#1a2236] rounded-xl transition duration-200 cursor-pointer border border-slate-800/60 shadow-lg flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square rounded-full overflow-hidden mb-3 border-2 border-slate-700 group-hover:border-cyan-400 transition-colors shadow">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-white truncate w-full group-hover:text-cyan-300">
                      {artist.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Matching Search */}
          {filteredPlaylists.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-white mb-3">Playlists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => navigateTo('playlist', { playlistId: pl.id })}
                    className="p-3.5 bg-[#121826] hover:bg-[#1a2236] rounded-xl transition duration-200 cursor-pointer border border-slate-800/60 shadow-lg"
                  >
                    <img
                      src={pl.coverArt}
                      alt={pl.title}
                      className="w-full aspect-square object-cover rounded-lg mb-3 shadow"
                    />
                    <h4 className="font-bold text-sm text-white truncate">{pl.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{pl.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {combinedTracks.length === 0 && !isLoadingLive && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No results found for "{searchQuery}"</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for another song, artist, or paste a link above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
