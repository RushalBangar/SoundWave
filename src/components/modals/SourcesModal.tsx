import React from 'react';
import { X, Music, Radio, ShieldCheck, ExternalLink, Cpu, Sparkles, Globe } from 'lucide-react';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-cyan-500/30 text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 text-black flex items-center justify-center shadow-md font-bold">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Song Sources & Audius API
              </h2>
              <p className="text-xs text-slate-400">Official open music streaming architecture</p>
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
          {/* Primary Source: Audius Open Music Network */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-purple-200">Audius Developer API (api.audius.co)</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Streaming
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              SoundWave directly connects to the <strong>Audius Discovery Network</strong>, a decentralized music streaming protocol hosting over 1,000,000+ full-length tracks with real artists, live search, and 320 kbps MP3 streams.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs">
              <a
                href="https://audius.co"
                target="_blank"
                rel="noreferrer"
                className="text-purple-300 hover:underline flex items-center gap-1 font-semibold"
              >
                Explore Audius.co
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Official Open API Protocol</span>
            </div>
          </div>

          {/* Source 2: SoundHelix Open Audio */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">SoundHelix Open Audio Project</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Creative Commons
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Algorithmic multi-instrumental musical compositions with analog synthesizers, dynamic drums, piano chords, and lo-fi textures for reliable offline and baseline listening.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs">
              <a
                href="https://www.soundhelix.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Visit SoundHelix
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">License: CC-BY 3.0</span>
            </div>
          </div>

          {/* Source 3: SoundWave High-Fi Procedural Web Audio Engine */}
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-300" />
                <h3 className="font-bold text-sm text-cyan-200">SoundWave Client-Side Synth Engine</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-black">
                Web Audio API
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Built-in client-side Web Audio harmonic engine that prevents buffer lockouts and ensures seamless, offline-ready playback.
            </p>
          </div>

          {/* Audio Specs */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-cyan-400 text-xs font-bold block">192–320 kbps</span>
              <span className="text-[10px] text-slate-400">High-Fidelity Audio</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-purple-400 text-xs font-bold block">1M+ Tracks</span>
              <span className="text-[10px] text-slate-400">Audius Open Catalog</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-cyan-400 text-xs font-bold block">100% Free</span>
              <span className="text-[10px] text-slate-400">No Paywalls</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
