import React from 'react';
import { X, Youtube, ShieldCheck, ExternalLink, Sparkles, Globe, Radio, Music } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-red-500/40 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-md font-bold">
              <Youtube className="w-6 h-6 fill-current text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                YouTube Music Library
              </h2>
              <p className="text-xs text-slate-400">100% Powered by YouTube with real-time metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Primary Source: YouTube Global Library */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500 fill-current" />
                <h3 className="font-bold text-sm text-red-200">YouTube Official Music & Video Catalog</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                100M+ Songs
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              SoundWave exclusively uses the <strong>YouTube Library</strong>. Any song, album, movie soundtrack, live concert, or indie release on YouTube can be searched, discovered, and played in high fidelity.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs">
              <a
                href="https://music.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                YouTube Music
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Live Global Streaming</span>
            </div>
          </div>

          {/* Real-time Metadata from YouTube */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Direct YouTube Metadata Extraction</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live & Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Song titles, artists, record labels, high-resolution album thumbnails (<code>hqdefault.jpg</code> & <code>maxresdefault.jpg</code>), duration, and view counts are fetched directly from YouTube via the official oEmbed protocol and YouTube Search API.
            </p>
          </div>

          {/* Paste Any YouTube Song Feature */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Universal Song Coverage</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Coverage
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If a song exists on YouTube, you can paste its link or 11-character video ID directly into the search bar or player to stream it instantly with full lyrics, Instagram EQ, and synchronized playback.
            </p>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
