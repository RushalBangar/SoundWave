import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  ListMusic,
  Laptop,
  Maximize2,
  Minimize2,
  Activity,
  Radio,
  Sliders,
  Sparkles,
  Youtube
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useSync } from '../../context/SyncContext';

interface BottomPlayerProps {
  onOpenConnectModal: () => void;
  onOpenEqualizer?: () => void;
  onOpenInstagramTemplate?: () => void;
  onToggleYouTubeVideo?: () => void;
  isYouTubeVideoOpen?: boolean;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({ 
  onOpenConnectModal,
  onOpenEqualizer,
  onOpenInstagramTemplate,
  onToggleYouTubeVideo,
  isYouTubeVideoOpen
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
    isLyricsOpen,
    isQueueOpen,
    isVisualizerActive,
    frequencyData,
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
    setIsLyricsOpen,
    setIsQueueOpen,
    setIsVisualizerActive,
    navigateTo
  } = useMusic();

  const { broadcastPlayPause, broadcastSeek } = useSync();
  const [isHoveredScrubber, setIsHoveredScrubber] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
    broadcastSeek(val);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <footer className="relative z-30 h-20 md:h-[88px] bg-[#0c1220] border-t border-slate-800/80 px-3 md:px-5 flex items-center justify-between select-none">
      {/* Visualizer Bar Banner (Optional Live Equalizer Waveform atop player) */}
      {isVisualizerActive && (
        <div className="absolute -top-3 inset-x-0 h-3 flex items-end justify-center gap-1 overflow-hidden pointer-events-none px-6 bg-gradient-to-t from-[#0c1220] to-transparent">
          {Array.from(frequencyData.slice(0, 32)).map((val, idx) => {
            const heightPercent = Math.max(15, Math.min(100, (val / 255) * 100));
            return (
              <span
                key={idx}
                className="w-1.5 rounded-t-sm bg-gradient-to-t from-cyan-500 via-sky-400 to-indigo-400 transition-all duration-75"
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      )}

      {/* LEFT SECTION: Track Info & Like */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px] max-w-[320px]">
        <div 
          onClick={() => navigateTo('artist', { artistId: currentTrack.artistId })}
          className="relative group cursor-pointer shrink-0"
        >
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="w-13 h-13 md:w-14 md:h-14 rounded-lg object-cover shadow-md group-hover:opacity-90 transition"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-1" />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-2" />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-3" />
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            onClick={() => navigateTo('playlist', { playlistId: 'pl-today-top' })}
            className="text-sm font-semibold truncate text-white hover:underline cursor-pointer"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </p>
          <div className="flex items-center gap-2 min-w-0 mt-0.5">
            <p
              onClick={() => navigateTo('artist', { artistId: currentTrack.artistId })}
              className="text-xs text-slate-400 hover:text-white truncate cursor-pointer hover:underline"
              title={currentTrack.artist}
            >
              {currentTrack.artist}
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`p-2 rounded-full transition active:scale-125 ${
            liked
              ? 'text-cyan-400 hover:text-cyan-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
          title={liked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-cyan-400' : ''}`} />
        </button>
      </div>

      {/* CENTER SECTION: Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center max-w-[680px] w-2/4 px-2">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 md:gap-6 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`transition relative ${
              isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle className="w-4 h-4 md:w-4.5 md:h-4.5" />
            {isShuffle && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={playPrevious}
            className="text-slate-400 hover:text-white transition active:scale-95"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Circular Button */}
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 hover:scale-105 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30 transition active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="text-slate-400 hover:text-white transition active:scale-95"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`transition relative ${
              repeatMode !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4 md:w-4.5 md:h-4.5" />
            ) : (
              <Repeat className="w-4 h-4 md:w-4.5 md:h-4.5" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Scrubber Timeline Bar */}
        <div 
          className="flex items-center gap-2.5 w-full text-[11px] text-slate-400 font-mono"
          onMouseEnter={() => setIsHoveredScrubber(true)}
          onMouseLeave={() => setIsHoveredScrubber(false)}
        >
          <span className="w-8 text-right select-none">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group py-2">
            {/* Background Track */}
            <div className="w-full h-1 bg-slate-700/80 rounded-full overflow-hidden">
              {/* Active Fill Track */}
              <div
                className={`h-full transition-colors ${
                  isHoveredScrubber ? 'bg-cyan-400' : 'bg-slate-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Invisible native range input overlay */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime || 0}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="w-8 text-left select-none">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT SECTION: Instagram EQ, Lyrics, Queue, Connect, Volume */}
      <div className="flex items-center justify-end gap-1.5 md:gap-2.5 w-1/4 min-w-[200px]">
        {/* Instagram Reel Audio Equalizer */}
        {onOpenEqualizer && (
          <button
            onClick={onOpenEqualizer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-slate-800 transition relative group"
            title="Instagram Audio Equalizer & Presets"
          >
            <Sliders className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 shadow" />
          </button>
        )}

        {/* Instagram Reels Music Template Card */}
        {onOpenInstagramTemplate && (
          <button
            onClick={onOpenInstagramTemplate}
            className="hidden sm:block p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-400 hover:bg-slate-800 transition"
            title="Instagram Reels Music Template & Metadata"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* Karaoke Lyrics Button */}
        <button
          onClick={() => setIsLyricsOpen(!isLyricsOpen)}
          className={`p-1.5 rounded-md transition ${
            isLyricsOpen ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Drawer Toggle */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 rounded-md transition ${
            isQueueOpen ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* SoundWave Connect / Devices */}
        <button
          onClick={onOpenConnectModal}
          className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 transition"
          title="SoundWave Connect"
        >
          <Laptop className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="hidden sm:flex items-center gap-1.5 group max-w-[120px]">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition p-1"
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
          <div className="relative flex-1 flex items-center group py-2 w-16 md:w-20">
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-300 group-hover:bg-cyan-400 transition-colors"
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

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:block p-1.5 text-slate-400 hover:text-white transition"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
};
