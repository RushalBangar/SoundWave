import React from 'react';
import { Home, Search, Library, Laptop, ArrowDownToLine, Play, Pause, Heart } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useSync } from '../../context/SyncContext';

interface MobileNavProps {
  onOpenDownloadModal: () => void;
  onOpenConnectModal: () => void;
  onExpandPlayer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenDownloadModal,
  onOpenConnectModal,
  onExpandPlayer
}) => {
  const {
    currentView,
    navigateTo,
    currentTrack,
    isPlaying,
    togglePlayPause,
    toggleLike,
    isLiked,
    currentTime,
    duration
  } = useMusic();

  const { broadcastPlayPause } = useSync();
  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex flex-col pointer-events-auto">
      {/* Floating Mobile Mini Player (Spotify mobile style) */}
      <div 
        onClick={onExpandPlayer}
        className="mx-2 mb-1 p-2 rounded-xl bg-[#151f32]/95 backdrop-blur-md border border-slate-700/60 shadow-2xl flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover shadow"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`p-2 transition ${liked ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              togglePlayPause();
              broadcastPlayPause(!isPlaying);
            }}
            className="w-8 h-8 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md active:scale-90 transition"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Mini progress line along bottom edge */}
        <div className="absolute bottom-0 inset-x-2 h-0.5 bg-slate-700/60 rounded-b-xl overflow-hidden">
          <div className="h-full bg-cyan-400" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Spotify Bottom Navigation Bar */}
      <nav className="h-14 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 flex items-center justify-around px-2 text-[10px] font-semibold text-slate-400 select-none">
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'home' ? 'text-cyan-400' : 'hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigateTo('search')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'search' ? 'text-cyan-400' : 'hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => navigateTo('library')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'library' || currentView === 'liked' || currentView === 'playlist'
              ? 'text-cyan-400'
              : 'hover:text-white'
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Your Library</span>
        </button>

        <button
          onClick={onOpenConnectModal}
          className="flex flex-col items-center gap-1 hover:text-white transition"
        >
          <Laptop className="w-5 h-5 text-cyan-400" />
          <span>Sync</span>
        </button>

        <button
          onClick={onOpenDownloadModal}
          className="flex flex-col items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span>Get App</span>
        </button>
      </nav>
    </div>
  );
};
