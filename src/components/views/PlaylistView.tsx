import React from 'react';
import { Play, Pause, Heart, Clock, MoreHorizontal, Download, Sparkles, Plus } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

export const PlaylistView: React.FC = () => {
  const {
    playlists,
    selectedPlaylistId,
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    toggleLike,
    isLiked,
    navigateTo
  } = useMusic();

  const playlist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];
  const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.floor(totalDuration / 60);

  const isPlaylistActive =
    isPlaying && playlistTracks.some(t => t.id === currentTrack.id);

  const handlePlayPlaylist = () => {
    if (playlistTracks.length === 0) return;
    if (isPlaylistActive) {
      togglePlayPause();
    } else {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  return (
    <div className="relative -mx-4 lg:-mx-6 -mt-3 pb-16">
      {/* Dynamic Ambient Gradient Banner (Spotify style) */}
      <div className={`p-6 lg:p-8 bg-gradient-to-b ${playlist.gradientColor} to-[#090d16] flex flex-col md:flex-row items-start md:items-end gap-6 transition-all duration-500`}>
        {/* Cover Art */}
        <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10">
          <img
            src={playlist.coverArt}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            {playlist.isCustom ? 'Custom Playlist' : 'Public Playlist'}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {playlist.title}
          </h1>
          <p className="text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-300 pt-2 font-medium">
            <span className="font-bold text-white">{playlist.owner}</span>
            <span>•</span>
            <span>{playlistTracks.length} songs</span>
            <span>•</span>
            <span className="text-slate-400">about {totalMins} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Big Play Button, Like, Download, Options) */}
      <div className="px-6 lg:px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayPlaylist}
          className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 hover:scale-105 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 transition active:scale-95 cursor-pointer"
          title={isPlaylistActive ? 'Pause' : 'Play'}
        >
          {isPlaylistActive ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        <button 
          className="p-2 text-slate-400 hover:text-cyan-400 transition"
          title="Save playlist"
        >
          <Heart className="w-7 h-7" />
        </button>

        <button 
          className="p-2 text-slate-400 hover:text-white transition"
          title="Download for offline listening"
        >
          <Download className="w-6 h-6" />
        </button>

        <button className="p-2 text-slate-400 hover:text-white transition">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="px-6 lg:px-8">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block col-span-3">Album</div>
          <div className="hidden lg:block col-span-2">Date Added</div>
          <div className="col-span-5 md:col-span-3 lg:col-span-1 text-right flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-transparent mt-1">
          {playlistTracks.map((track, idx) => {
            const isThisPlaying = isPlaying && currentTrack.id === track.id;
            const liked = isLiked(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, playlistTracks)}
                className={`group grid grid-cols-12 gap-4 px-4 py-2.5 rounded-lg items-center cursor-pointer transition ${
                  currentTrack.id === track.id
                    ? 'bg-slate-800/80 text-cyan-400'
                    : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                {/* Index / Play / Waveform Icon */}
                <div className="col-span-1 text-center font-mono text-xs text-slate-400 flex items-center justify-center">
                  {isThisPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-1" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-2" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-3" />
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <Play className="w-4 h-4 fill-current hidden group-hover:block translate-x-0.5 text-white" />
                    </>
                  )}
                </div>

                {/* Title & Artist & Thumbnail */}
                <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-10 h-10 rounded-md object-cover shrink-0 shadow"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${currentTrack.id === track.id ? 'text-cyan-400' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('artist', { artistId: track.artistId });
                      }}
                      className="text-xs text-slate-400 hover:text-white truncate hover:underline"
                    >
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Album */}
                <div className="hidden md:block col-span-3 text-xs text-slate-400 truncate">
                  {track.album}
                </div>

                {/* Date Added */}
                <div className="hidden lg:block col-span-2 text-xs text-slate-400">
                  {track.addedAt || 'Recently'}
                </div>

                {/* Like & Duration */}
                <div className="col-span-5 md:col-span-3 lg:col-span-1 flex items-center justify-end gap-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className={`p-1 transition ${
                      liked ? 'text-cyan-400' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-cyan-400' : ''}`} />
                  </button>
                  <span className="font-mono text-xs text-slate-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {playlistTracks.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-base font-semibold text-white">This playlist is currently empty</p>
            <p className="text-xs mt-1">Search for songs and add them to this playlist.</p>
          </div>
        )}
      </div>
    </div>
  );
};
