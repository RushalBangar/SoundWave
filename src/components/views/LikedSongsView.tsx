import React from 'react';
import { Play, Pause, Heart, Clock } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

export const LikedSongsView: React.FC = () => {
  const {
    tracks,
    likedTrackIds,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    toggleLike,
    navigateTo
  } = useMusic();

  const likedTracks = tracks.filter(t => likedTrackIds.includes(t.id));
  const isLikedActive = isPlaying && likedTracks.some(t => t.id === currentTrack.id);

  const handlePlayLiked = () => {
    if (likedTracks.length === 0) return;
    if (isLikedActive) {
      togglePlayPause();
    } else {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  return (
    <div className="relative -mx-4 lg:-mx-6 -mt-3 pb-16">
      {/* Liked Songs Signature Hero Gradient (Purple to Cyan Glow) */}
      <div className="p-6 lg:p-8 bg-gradient-to-b from-indigo-700 via-cyan-900 to-[#090d16] flex flex-col md:flex-row items-start md:items-end gap-6">
        <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-sky-400 flex items-center justify-center shadow-2xl shadow-cyan-950/60 border border-white/20">
          <Heart className="w-24 h-24 text-white fill-white" />
        </div>

        <div className="flex-1 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Playlist
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-md">
            Liked Songs
          </h1>
          <p className="text-xs text-slate-300 pt-2 font-medium">
            <span className="font-bold text-white">Your Collection</span> • {likedTracks.length} songs
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 lg:px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayLiked}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 hover:scale-105 disabled:opacity-50 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 transition active:scale-95 cursor-pointer"
          title={isLikedActive ? 'Pause' : 'Play'}
        >
          {isLikedActive ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Tracks Table */}
      <div className="px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block col-span-3">Album</div>
          <div className="hidden lg:block col-span-2">Date Added</div>
          <div className="col-span-5 md:col-span-3 lg:col-span-1 text-right flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="divide-y divide-transparent mt-1">
          {likedTracks.map((track, idx) => {
            const isThisPlaying = isPlaying && currentTrack.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, likedTracks)}
                className={`group grid grid-cols-12 gap-4 px-4 py-2.5 rounded-lg items-center cursor-pointer transition ${
                  currentTrack.id === track.id
                    ? 'bg-slate-800/80 text-cyan-400'
                    : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
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

                <div className="hidden md:block col-span-3 text-xs text-slate-400 truncate">
                  {track.album}
                </div>

                <div className="hidden lg:block col-span-2 text-xs text-slate-400">
                  {track.addedAt || 'Recently'}
                </div>

                <div className="col-span-5 md:col-span-3 lg:col-span-1 flex items-center justify-end gap-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                    title="Remove from Liked Songs"
                  >
                    <Heart className="w-4 h-4 fill-cyan-400" />
                  </button>
                  <span className="font-mono text-xs text-slate-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {likedTracks.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Songs you like will appear here</h3>
            <p className="text-xs mt-1">Save songs by tapping the heart icon on any song.</p>
          </div>
        )}
      </div>
    </div>
  );
};
