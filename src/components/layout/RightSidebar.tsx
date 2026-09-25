import React from 'react';
import { X, Play, Heart, Plus, Check, Radio, UserPlus, Sliders, Sparkles, Youtube, ExternalLink } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface RightSidebarProps {
  onOpenEqualizer?: () => void;
  onOpenInstagramTemplate?: () => void;
  onToggleYouTubeVideo?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onOpenEqualizer,
  onOpenInstagramTemplate,
  onToggleYouTubeVideo
}) => {
  const {
    currentTrack,
    queue,
    playTrack,
    isLiked,
    toggleLike,
    isRightSidebarOpen,
    isQueueOpen,
    setIsRightSidebarOpen,
    setIsQueueOpen,
    artists,
    navigateTo
  } = useMusic();

  const isOpen = isRightSidebarOpen || isQueueOpen;
  if (!isOpen) return null;

  const currentArtist = artists.find(a => a.id === currentTrack.artistId) || {
    id: currentTrack.artistId,
    name: currentTrack.artist,
    avatar: currentTrack.albumArt,
    monthlyListeners: 4200000,
    bio: 'Independent SoundWave artist creating cutting-edge electronic and chill soundscapes.'
  };

  const liked = isLiked(currentTrack.id);
  const nextTracks = queue.filter(t => t.id !== currentTrack.id).slice(0, 8);

  return (
    <aside className="w-80 h-full bg-[#121826] border-l border-slate-800/80 p-4 flex flex-col overflow-y-auto scrollbar-thin select-none shrink-0 z-10">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <h3 className="font-bold text-base text-white">
          {isQueueOpen ? 'Playback Queue' : currentTrack.title}
        </h3>
        <button
          onClick={() => {
            setIsRightSidebarOpen(false);
            setIsQueueOpen(false);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* QUEUE VIEW */}
      {isQueueOpen ? (
        <div className="py-4 space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-cyan-500/30">
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-cyan-400">{currentTrack.title}</p>
                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Next In Queue ({nextTracks.length})
            </span>
            <div className="space-y-1.5">
              {nextTracks.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-500 w-4">{i + 1}</span>
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-white group-hover:text-cyan-400">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 text-cyan-400 transition">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* NOW PLAYING VIEW */
        <div className="py-4 space-y-5">
          {/* Big Album Art */}
          <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* Title & Artist & Like */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">{currentTrack.title}</h2>
              <p
                onClick={() => navigateTo('artist', { artistId: currentTrack.artistId })}
                className="text-sm text-slate-400 hover:text-white cursor-pointer hover:underline"
              >
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className={`p-2 transition ${liked ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Special Actions: Instagram EQ, Reels Template, YouTube Video */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {onOpenEqualizer && (
                <button
                  onClick={onOpenEqualizer}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 hover:from-pink-500/30 hover:to-amber-500/30 border border-pink-500/40 text-left transition group"
                >
                  <div className="flex items-center gap-1.5 text-pink-400 font-bold text-xs">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>IG Equalizer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Reels Punch EQ</p>
                </button>
              )}

              {onOpenInstagramTemplate && (
                <button
                  onClick={onOpenInstagramTemplate}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition"
                >
                  <div className="flex items-center gap-1.5 text-fuchsia-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reels Card</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">9:16 Story Template</p>
                </button>
              )}
            </div>

            {onToggleYouTubeVideo && currentTrack.youtubeId && (
              <button
                onClick={onToggleYouTubeVideo}
                className="w-full p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500 fill-current" />
                  <span>Watch on YouTube</span>
                </div>
                <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-300">
                  Official Video
                </span>
              </button>
            )}
          </div>

          {/* About The Artist Card */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img
              src={currentArtist.avatar}
              alt={currentArtist.name}
              className="w-full h-40 object-cover brightness-75"
            />
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">{currentArtist.name}</h4>
                  <p className="text-xs text-slate-400">
                    {Math.round(currentArtist.monthlyListeners / 1000000)}M monthly listeners
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('artist', { artistId: currentArtist.id })}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-600 hover:border-white text-white transition"
                >
                  View Profile
                </button>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {currentArtist.bio}
              </p>
            </div>
          </div>

          {/* Audio Source & Licensing Info */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Audio Source & License
            </span>
            <p className="text-xs font-semibold text-white">
              {currentTrack.source || 'SoundHelix Open Music Library (Creative Commons)'}
            </p>
            <p className="text-[11px] text-slate-400">
              High-quality 320 kbps royalty-free streaming audio with live spectrum frequency analysis.
            </p>
          </div>

          {/* Up Next Preview */}
          {nextTracks[0] && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Up next
              </span>
              <div 
                onClick={() => playTrack(nextTracks[0])}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={nextTracks[0].albumArt}
                  alt={nextTracks[0].title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white group-hover:text-cyan-400">
                    {nextTracks[0].title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{nextTracks[0].artist}</p>
                </div>
                <Play className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
