import React, { useState } from 'react';
import { Play, Pause, Heart, Check, BadgeCheck, MoreHorizontal, UserPlus } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

export const ArtistView: React.FC = () => {
  const {
    artists,
    selectedArtistId,
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    isLiked,
    toggleLike
  } = useMusic();

  const [isFollowing, setIsFollowing] = useState(false);

  const artist = artists.find(a => a.id === selectedArtistId) || artists[0];
  const artistTracks = tracks.filter(t => t.artistId === artist.id || artist.popularTrackIds.includes(t.id));

  const isArtistPlaying =
    isPlaying && artistTracks.some(t => t.id === currentTrack.id);

  const handlePlayArtist = () => {
    if (artistTracks.length === 0) return;
    if (isArtistPlaying) {
      togglePlayPause();
    } else {
      playTrack(artistTracks[0], artistTracks);
    }
  };

  return (
    <div className="relative -mx-4 lg:-mx-6 -mt-3 pb-16">
      {/* Giant Hero Banner with Artist Cover Photo (Spotify Artist Page style) */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden flex flex-col justify-end p-6 lg:p-8">
        <img
          src={artist.coverImage}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent" />

        <div className="relative z-10 space-y-2">
          {artist.verified && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <BadgeCheck className="w-5 h-5 fill-cyan-400 text-black" />
              <span>Verified Artist</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {artist.name}
          </h1>
          <p className="text-sm font-semibold text-slate-300">
            {artist.monthlyListeners.toLocaleString()} monthly listeners
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="px-6 lg:px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayArtist}
          className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 hover:scale-105 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 transition active:scale-95 cursor-pointer"
          title={isArtistPlaying ? 'Pause' : 'Play'}
        >
          {isArtistPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition ${
            isFollowing
              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
              : 'border-slate-500 text-white hover:border-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <button className="p-2 text-slate-400 hover:text-white transition">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Popular Tracks Section */}
      <div className="px-6 lg:px-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Popular</h3>
          <div className="divide-y divide-slate-800/40">
            {artistTracks.map((track, idx) => {
              const isThisPlaying = isPlaying && currentTrack.id === track.id;
              const liked = isLiked(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, artistTracks)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    currentTrack.id === track.id
                      ? 'bg-slate-800/80 text-cyan-400'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-4 text-xs font-mono text-slate-500 text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shadow"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${currentTrack.id === track.id ? 'text-cyan-400' : 'text-white'}`}>
                        {track.title}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block text-xs font-mono text-slate-400 w-32 text-right">
                    {(track.plays || 1204900).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-4 ml-6">
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
                    <span className="font-mono text-xs text-slate-400 w-10 text-right">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* About The Artist Section */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">About</h3>
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 md:p-8 max-w-3xl">
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              {artist.bio}
            </p>
            <div className="mt-6 flex items-center gap-6 text-sm">
              <div>
                <span className="text-2xl font-black text-white block">
                  {artist.monthlyListeners.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Monthly Listeners
                </span>
              </div>
              <div className="border-l border-slate-800 pl-6">
                <span className="text-2xl font-black text-cyan-400 block">
                  #14
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  In Global Electronic Chart
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
