import React, { useMemo } from 'react';
import { Search, Play, Pause, Heart, Radio, Loader2, Sparkles, Music2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

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
    isAudiusConnected
  } = useMusic();

  const query = searchQuery.trim().toLowerCase();

  const quickSearchTags = [
    { label: '🇮🇳 Bollywood & Hindi', query: 'Hindi' },
    { label: '🚩 Marathi Maati', query: 'Marathi' },
    { label: '🥁 Zingaat & Dhol Tasha', query: 'Zingaat' },
    { label: '🙏 Mauli Mauli & Abhang', query: 'Mauli' },
    { label: '☕ Hindi Lo-Fi & Chai', query: 'Hindi Lo-Fi' },
    { label: '💃 Marathi Lavani', query: 'Lavani' },
    { label: '❤️ Kesariya & Sufi', query: 'Kesariya' },
    { label: '⚡ Synthwave', query: 'Synthwave' }
  ];

  // Merge live Audius results with cached tracks (deduping by ID or title)
  const combinedTracks = useMemo(() => {
    if (!query) return [];
    const localMatches = tracks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query) ||
      (t.language && t.language.toLowerCase().includes(query))
    );

    const merged = [...liveSearchResults];
    const seenTitles = new Set(liveSearchResults.map(t => t.title.toLowerCase()));

    for (const t of localMatches) {
      if (!seenTitles.has(t.title.toLowerCase())) {
        merged.push(t);
        seenTitles.add(t.title.toLowerCase());
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

  return (
    <div className="space-y-8 pb-12">
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Browse all
            </h2>
            {isAudiusConnected && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs font-semibold text-purple-300">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                Audius API Connected
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.name)}
                className={`relative h-44 rounded-xl overflow-hidden p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg ${cat.color}`}
              >
                <h3 className="font-extrabold text-lg md:text-xl text-white tracking-tight leading-tight">
                  {cat.name}
                </h3>

                {/* Angled Cover Art Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute -bottom-2 -right-4 w-28 h-28 object-cover rounded-lg rotate-[22deg] shadow-2xl brightness-90"
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* If Search Query is Entered: Show Search Results */
        <div className="space-y-8">
          {/* Search Header Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>Results for "<strong className="text-white">{searchQuery}</strong>"</span>
              {isLoadingLive && (
                <span className="flex items-center gap-1.5 text-xs text-cyan-400 animate-pulse font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching Audius Network...
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {combinedTracks.length} tracks found
            </span>
          </div>

          {/* Top Result + Songs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Result Card */}
            {topResult && (
              <div className="lg:col-span-5">
                <h3 className="text-lg font-bold text-white mb-3">Top result</h3>
                <div
                  onClick={() => playTrack(topResult, combinedTracks)}
                  className="group relative p-5 rounded-2xl bg-[#151d2e] hover:bg-[#1b263b] border border-slate-800 transition duration-300 cursor-pointer shadow-xl flex flex-col justify-between h-60"
                >
                  <img
                    src={topResult.albumArt}
                    alt={topResult.title}
                    className="w-20 h-20 rounded-xl object-cover shadow-lg"
                  />

                  <div className="mt-3">
                    <h4 className="text-xl md:text-2xl font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {topResult.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <span>{topResult.artist}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-[10px] font-bold text-cyan-300 border border-cyan-800/50">
                        {topResult.genre || 'Song'}
                      </span>
                      {topResult.language && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {topResult.language}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {topResult.source || 'Audius Music Network'}
                    </p>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentTrack.id === topResult.id) togglePlayPause();
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
              <h3 className="text-lg font-bold text-white mb-3">Songs</h3>
              <div className="space-y-1">
                {combinedTracks.slice(0, 6).map((track) => {
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
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                            <span>{track.artist}</span>
                            {track.language && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {track.language}
                              </span>
                            )}
                            {track.id.startsWith('audius-') && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Audius
                              </span>
                            )}
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
                Try searching for Bollywood, Hindi, Marathi, Zingaat, Arijit, or browse the categories above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
