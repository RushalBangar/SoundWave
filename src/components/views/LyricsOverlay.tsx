import React, { useMemo } from 'react';
import { X, Mic2, Sparkles, Volume2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

export const LyricsOverlay: React.FC = () => {
  const {
    currentTrack,
    currentTime,
    duration,
    seekTo,
    isLyricsOpen,
    setIsLyricsOpen
  } = useMusic();

  if (!isLyricsOpen) return null;

  const lyrics = currentTrack.lyrics || [
    "Instrumental breakdown",
    "Feeling the soundwave vibrate in your soul",
    "Synths and basslines taking complete control",
    "Close your eyes and let the frequencies flow"
  ];

  // Calculate current active line based on playback time
  const activeLineIndex = useMemo(() => {
    if (duration <= 0) return 0;
    const progress = currentTime / duration;
    const index = Math.floor(progress * lyrics.length);
    return Math.min(lyrics.length - 1, Math.max(0, index));
  }, [currentTime, duration, lyrics.length]);

  const handleLineClick = (idx: number) => {
    if (duration > 0 && lyrics.length > 0) {
      const targetTime = (idx / lyrics.length) * duration;
      seekTo(targetTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-xl flex flex-col p-6 md:p-12 animate-in fade-in duration-300 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-4">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-xl object-cover shadow-xl border border-cyan-500/20"
          />
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5" />
              Synced Lyrics
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white truncate">
              {currentTrack.title}
            </h2>
            <p className="text-xs text-slate-400 font-medium">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Lyrics Display (Spotify Karaoke Scroll) */}
      <div className="flex-1 overflow-y-auto py-12 md:py-16 space-y-6 md:space-y-8 scrollbar-thin text-left max-w-4xl mx-auto w-full">
        {lyrics.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          const isPast = idx < activeLineIndex;

          return (
            <p
              key={idx}
              onClick={() => handleLineClick(idx)}
              className={`cursor-pointer transition-all duration-300 font-extrabold tracking-tight leading-snug ${
                isActive
                  ? 'text-white text-2xl md:text-4xl lg:text-5xl scale-100 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] text-cyan-200'
                  : isPast
                  ? 'text-slate-400 text-xl md:text-3xl opacity-60 hover:opacity-90'
                  : 'text-slate-500 text-xl md:text-3xl opacity-35 hover:opacity-75'
              }`}
            >
              {line}
            </p>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span>Click any line to jump to that part of the track</span>
        <span className="text-cyan-400 font-mono font-medium">SoundWave Live Karaoke</span>
      </div>
    </div>
  );
};
