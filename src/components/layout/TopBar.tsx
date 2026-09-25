import React from 'react';
import { ChevronLeft, ChevronRight, Search as SearchIcon, Smartphone, Laptop, Radio, Info } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useSync } from '../../context/SyncContext';

interface TopBarProps {
  onOpenDownloadModal: () => void;
  onOpenConnectModal: () => void;
  onOpenSourcesModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenDownloadModal, onOpenConnectModal, onOpenSourcesModal }) => {
  const {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery
  } = useMusic();

  const { activeDevice, recentSyncActivity } = useSync();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 py-3 bg-[#0c1220]/80 backdrop-blur-md border-b border-slate-800/40">
      {/* Navigation history controls & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Back / Forward arrows */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/60 transition ${
              canGoBack
                ? 'text-white hover:bg-black/90 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/60 transition ${
              canGoForward
                ? 'text-white hover:bg-black/90 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search') {
                navigateTo('search');
              }
            }}
            onFocus={() => {
              if (currentView !== 'search') {
                navigateTo('search');
              }
            }}
            className="w-full bg-[#182234] hover:bg-[#202c44] focus:bg-[#202c44] text-sm text-white placeholder-slate-400 pl-9 pr-4 py-2 rounded-full border border-slate-700/60 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition"
          />
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Sync activity toast if any */}
        {recentSyncActivity && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{recentSyncActivity}</span>
          </div>
        )}

        {/* SoundWave Connect / Cross-Platform Sync Button */}
        <button
          onClick={onOpenConnectModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition shadow-sm"
          title="SoundWave Connect: Sync with other devices"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-semibold">{activeDevice.name.split(' ')[0]}</span>
          <span className="hidden md:inline text-[11px] text-cyan-300 font-semibold">• Sync</span>
        </button>

        {/* Download App (iOS & Android) Button */}
        <button
          onClick={onOpenDownloadModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-black" />
          <span>Get App</span>
        </button>

        {/* Song Sources & Audio Engine info */}
        <button
          onClick={onOpenSourcesModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition"
          title="Where SoundWave gets its songs and audio licensing"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Song Sources</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow cursor-pointer hover:scale-105 transition shrink-0">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-cyan-300">
            SW
          </div>
        </div>
      </div>
    </header>
  );
};
