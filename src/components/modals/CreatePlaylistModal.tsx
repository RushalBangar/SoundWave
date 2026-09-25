import React, { useState } from 'react';
import { X, Music2, Sparkles } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist, navigateTo } = useMusic();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlaylist = createPlaylist(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    onClose();
    navigateTo('playlist', { playlistId: newPlaylist.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#0e1626] border border-cyan-500/30 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Music2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Create New Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Playlist Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Drives"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 text-sm text-white placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Give your playlist a catchy description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 text-sm text-white placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
