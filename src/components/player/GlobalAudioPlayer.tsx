import React, { useState } from 'react';
import { Youtube, X, Maximize2, Minimize2, ExternalLink, Plus, Sparkles, Volume2, Music } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface GlobalAudioPlayerProps {
  onAddCustomTrack?: (urlOrId: string) => void;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ onAddCustomTrack }) => {
  const {
    currentTrack,
    isPlaying,
    isYouTubeVideoOpen,
    setIsYouTubeVideoOpen
  } = useMusic();

  const [isMinimized, setIsMinimized] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [inputError, setInputError] = useState('');

  // Only render if track has a youtubeId
  const hasYoutubeId = Boolean(currentTrack.youtubeId);
  const activeVideoId = currentTrack.youtubeId || 'BddP6PYo2gs';

  if (!hasYoutubeId) return null;

  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    let videoId = customUrl.trim();
    const match = customUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    } else if (videoId.length !== 11) {
      setInputError('Please enter a valid YouTube link or 11-character video ID');
      return;
    }

    setInputError('');
    if (onAddCustomTrack) {
      onAddCustomTrack(videoId);
    }
    setCustomUrl('');
  };

  // If user has not opened the video window AND is not playing, keep unmounted to save resources
  if (!isYouTubeVideoOpen && !isPlaying) {
    return null;
  }

  return (
    <>
      {/* 
        Picture-in-Picture / Floating Video Player
        Visible when isYouTubeVideoOpen is TRUE.
        When isYouTubeVideoOpen is FALSE and isPlaying is TRUE,
        the iframe stays mounted offscreen so the authentic official audio streams continuously!
      */}
      <div
        className={
          isYouTubeVideoOpen
            ? `fixed z-50 transition-all duration-300 ${
                isMinimized
                  ? 'bottom-24 right-4 sm:right-6 w-72 rounded-2xl overflow-hidden shadow-2xl border border-red-500/50 bg-black'
                  : 'bottom-24 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-96 max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-red-500/50 bg-[#0d131f]'
              }`
            : 'fixed -top-[9999px] -left-[9999px] w-[200px] h-[200px] pointer-events-none opacity-0'
        }
      >
        {isYouTubeVideoOpen && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-3.5 py-2 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-2 min-w-0">
              <Youtube className="w-4 h-4 text-white fill-current shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">YouTube Official Video</h4>
                <p className="text-[10px] text-red-100 truncate">{currentTrack.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-white/20 transition text-white"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsYouTubeVideoOpen(false)}
                className="p-1 rounded hover:bg-white/20 transition text-white"
                title="Hide Video (Audio Continues)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Declarative Embedded Official YouTube Stream */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={activeVideoId}
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=${isPlaying ? '1' : '0'}&enablejsapi=1`}
            title={currentTrack.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {isYouTubeVideoOpen && !isMinimized && (
          <div className="p-3 bg-[#111827] space-y-2 text-xs text-white">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold text-white truncate max-w-[200px]">
                {currentTrack.artist}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 shrink-0 font-medium"
              >
                YouTube App
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Paste any YouTube Song Form */}
            <form onSubmit={handleAddTrackSubmit} className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Paste YouTube link or video ID..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition text-xs shrink-0 shadow"
                >
                  Play
                </button>
              </div>
              {inputError && <p className="text-[10px] text-red-400">{inputError}</p>}
            </form>
          </div>
        )}
      </div>
    </>
  );
};
