import React from 'react';
import { X, ShieldCheck, Sparkles, Globe, Radio, Music } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-cyan-500/40 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md font-bold">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SoundWave Music Catalog
              </h2>
              <p className="text-xs text-slate-400">Universal streaming audio catalog with real-time metadata</p>
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
          {/* Universal Catalog */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-cyan-200">Global Music Database</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                100M+ Songs
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              SoundWave indexes and delivers any song, soundtrack, or artist release in lossless fidelity with synchronized audio and volume processing.
            </p>
          </div>

          {/* Real-time Metadata */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Direct Real-Time Metadata</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live & Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Titles, artists, release artwork, BPM analysis, keys, and song lyrics are continuously synchronized to ensure exact audio matching and zero mismatching.
            </p>
          </div>

          {/* Universal Coverage */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Full Cross-Platform Synchronization</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Hi-Fi Stereo
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with Instagram audio filters, customized equalizers, cross-device sync, and mobile-optimized touch controls.
            </p>
          </div>
        </div>

        <div className="p-4 bg-black/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs rounded-xl shadow-lg transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
