import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart, Music2, User, Search as SearchIcon, ArrowDownToLine, Radio, Disc3, Info } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Playlist } from '../../types/music';

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
  onOpenDownloadModal: () => void;
  onOpenSourcesModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePlaylist, onOpenDownloadModal, onOpenSourcesModal }) => {
  const {
    currentView,
    navigateTo,
    playlists,
    artists,
    likedTrackIds,
    selectedPlaylistId,
    selectedArtistId,
    playTrack,
    tracks,
    isPlaying,
    currentTrack
  } = useMusic();

  const [libraryFilter, setLibraryFilter] = useState<'all' | 'playlists' | 'artists'>('all');
  const [librarySearch, setLibrarySearch] = useState('');

  const filteredPlaylists = playlists.filter(p =>
    (libraryFilter === 'all' || libraryFilter === 'playlists') &&
    p.title.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const filteredArtists = artists.filter(a =>
    (libraryFilter === 'all' || libraryFilter === 'artists') &&
    a.name.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-black gap-2 p-2 shrink-0 select-none text-slate-300">
      {/* Top Capsule: SoundWave Brand & Main Navigation */}
      <div className="bg-[#121826] rounded-xl p-4 flex flex-col gap-4 shadow-lg border border-slate-800/60">
        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 cursor-pointer group px-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            {/* SoundWave curved stylized wave bars */}
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-black rounded-full" />
              <span className="w-1 h-5 bg-black rounded-full" />
              <span className="w-1 h-3 bg-black rounded-full" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              SoundWave
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">High-Fidelity Audio</p>
          </div>
        </div>

        {/* Home & Search links */}
        <nav className="flex flex-col gap-1 pt-1">
          <button
            onClick={() => navigateTo('home')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              currentView === 'home'
                ? 'text-white bg-slate-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-cyan-400' : ''}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigateTo('search')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
              currentView === 'search'
                ? 'text-white bg-slate-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Search className={`w-5 h-5 ${currentView === 'search' ? 'text-cyan-400' : ''}`} />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Bottom Capsule: Your Library */}
      <div className="flex-1 bg-[#121826] rounded-xl flex flex-col overflow-hidden shadow-lg border border-slate-800/60 min-h-0">
        {/* Library Header */}
        <div className="p-4 pb-2 border-b border-slate-800/40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateTo('library')}
              className="flex items-center gap-2.5 text-slate-300 hover:text-white transition group"
            >
              <Library className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
              <span className="font-bold text-sm">Your Library</span>
            </button>

            <button
              onClick={onOpenCreatePlaylist}
              title="Create playlist"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3">
            {(['all', 'playlists', 'artists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLibraryFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  libraryFilter === filter
                    ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Quick Library Search */}
          <div className="relative mt-3">
            <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in Library"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full bg-slate-900/80 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Scrollable Library Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {/* Liked Songs Entry */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists') && (
            <div
              onClick={() => navigateTo('liked')}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                currentView === 'liked'
                  ? 'bg-slate-800 text-white'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-600 via-cyan-600 to-sky-400 flex items-center justify-center shrink-0 shadow-md">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">Liked Songs</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">📌 Pinned</span> • Playlist • {likedTrackIds.length} songs
                </p>
              </div>
            </div>
          )}

          {/* Playlists */}
          {filteredPlaylists.map((pl) => {
            const isSelected = currentView === 'playlist' && selectedPlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => navigateTo('playlist', { playlistId: pl.id })}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'bg-slate-800 text-white'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <img
                  src={pl.coverArt}
                  alt={pl.title}
                  className="w-11 h-11 rounded-lg object-cover shrink-0 shadow"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    {pl.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Playlist • {pl.owner}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Artists */}
          {filteredArtists.map((artist) => {
            const isSelected = currentView === 'artist' && selectedArtistId === artist.id;
            return (
              <div
                key={artist.id}
                onClick={() => navigateTo('artist', { artistId: artist.id })}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'bg-slate-800 text-white'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0 shadow"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    {artist.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Artist • {Math.round(artist.monthlyListeners / 1000000)}M listeners
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Download SoundWave Mobile App banner & Sources */}
        <div className="p-3 border-t border-slate-800/40 bg-slate-900/60 space-y-2">
          <button
            onClick={onOpenDownloadModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition"
          >
            <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
            <span>Get App for iOS & Android</span>
          </button>
          <button
            onClick={onOpenSourcesModal}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-400 hover:text-cyan-300 transition"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Where do songs come from?</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
