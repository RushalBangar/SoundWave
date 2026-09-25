import React from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Mic2, 
  Laptop, 
  Sliders, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Volume1 
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useSync } from '../../context/SyncContext';

interface MobilePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal: () => void;
  onOpenEqualizer?: () => void;
  onOpenInstagramTemplate?: () => void;
}

export const MobilePlayerModal: React.FC<MobilePlayerModalProps> = ({
  isOpen,
  onClose,
  onOpenConnectModal,
  onOpenEqualizer,
  onOpenInstagramTemplate
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isLiked,
    toggleLike,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setPlayerVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsLyricsOpen
  } = useMusic();

  const { broadcastPlayPause, broadcastSeek } = useSync();

  if (!isOpen) return null;

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = () => {
    togglePlayPause();
    broadcastPlayPause(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
    broadcastSeek(val);
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-[#111e33] via-[#090d16] to-[#090d16] flex flex-col justify-between p-5 pb-8 select-none animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 shrink-0">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-slate-300 hover:text-white transition active:scale-90"
          title="Minimize player"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <div className="text-center min-w-0 px-2 flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
            {currentTrack.source || 'Playing in SoundWave'}
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[200px] block mx-auto">
            {currentTrack.album}
          </span>
        </div>

        <div className="w-8" />
      </div>

      {/* Middle Display Area (Album Artwork) */}
      <div className="my-auto py-3 flex flex-col items-center justify-center shrink-0">
        <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/70 border border-slate-800 relative bg-black">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="space-y-4 shrink-0">
        {/* Track Title, Artist, & Like Button */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`p-2 transition active:scale-125 ${liked ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title={liked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="space-y-1">
          <div className="relative flex items-center py-2">
            <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${progressPercent}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 transition ${isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button onClick={playPrevious} className="p-2 text-white active:scale-90 transition">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 active:scale-95 transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next */}
          <button onClick={playNext} className="p-2 text-white active:scale-90 transition">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2 transition ${repeatMode !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Slider for Mobile */}
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="relative flex-1 flex items-center py-2">
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-300"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Audio Tools: Instagram EQ, Template, Lyrics */}
        <div className="flex items-center justify-around py-2 px-2 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs font-semibold">
          {onOpenEqualizer && (
            <button
              onClick={() => {
                onClose();
                onOpenEqualizer();
              }}
              className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 p-1"
            >
              <Sliders className="w-4 h-4" />
              <span>IG EQ</span>
            </button>
          )}

          {onOpenInstagramTemplate && (
            <button
              onClick={() => {
                onClose();
                onOpenInstagramTemplate();
              }}
              className="flex items-center gap-1.5 text-fuchsia-400 hover:text-fuchsia-300 p-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>IG Reel</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              setIsLyricsOpen(true);
            }}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 p-1"
          >
            <Mic2 className="w-4 h-4" />
            <span>Lyrics</span>
          </button>
        </div>

        {/* Bottom Connect row */}
        <div className="flex items-center justify-center pt-0.5 text-xs font-semibold">
          <button
            onClick={() => {
              onClose();
              onOpenConnectModal();
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-300"
          >
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>SoundWave Connect & Devices</span>
          </button>
        </div>
      </div>
    </div>
  );
};
