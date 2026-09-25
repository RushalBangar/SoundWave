import React, { useState } from 'react';
import { X, Play, Pause, Heart, Share2, Copy, Check, ExternalLink, Sliders, Music, Sparkles, Flame } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

interface InstagramTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  onOpenEqualizer: () => void;
  onOpenYouTubeVideo?: () => void;
}

export const InstagramTemplateModal: React.FC<InstagramTemplateModalProps> = ({
  isOpen,
  onClose,
  track,
  onOpenEqualizer
}) => {
  const { isPlaying, currentTrack, togglePlayPause, playTrack, isLiked, toggleLike, frequencyData } = useMusic();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isCurrentTrack = currentTrack.id === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;
  const liked = isLiked(track.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(`♫ ${track.title} by ${track.artist} - Stream on SoundWave Hi-Fi`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 4 Instagram Audio Sticker jumping bars
  const bar1 = Math.max(12, (frequencyData[2] || 60) / 2.8);
  const bar2 = Math.max(22, (frequencyData[6] || 120) / 2.8);
  const bar3 = Math.max(18, (frequencyData[12] || 180) / 2.8);
  const bar4 = Math.max(10, (frequencyData[18] || 80) / 2.8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0b101c] border border-pink-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Instagram Header */}
        <div className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📸</span>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                Instagram Reels Music Template
              </h3>
              <p className="text-[11px] text-white/80">Original High-Quality Audio & Metadata</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* 9:16 Instagram Story Preview Card */}
          <div className="relative aspect-[9/14] w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-4 flex flex-col justify-between group">
            {/* Background Blur Artwork */}
            <img 
              src={track.albumArt} 
              alt={track.title} 
              className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-xl brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Top Story Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                  <img src={track.albumArt} alt="" className="w-full h-full rounded-full object-cover border border-black" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">{track.artistHandle || `@${track.artist.toLowerCase().replace(/\s+/g, '')}`}</p>
                  <p className="text-[9px] text-white/70">Sponsored • Audio Template</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-pink-300 border border-white/20">
                {track.igReelsCount || 'Trending'}
              </span>
            </div>

            {/* Center Album Art with Vinyl Shadow */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/30 group-hover:scale-105 transition-transform duration-300">
                <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                {/* Floating Play Button */}
                <button
                  onClick={() => {
                    if (isCurrentTrack) togglePlayPause();
                    else playTrack(track);
                  }}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl hover:scale-110 transition"
                >
                  {isThisPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
                </button>
              </div>

              {/* Instagram Audio Sticker Pill */}
              <div className="mt-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white shadow-lg">
                <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
                  <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${isThisPlaying ? bar1 : 6}px` }} />
                  <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${isThisPlaying ? bar2 : 12}px` }} />
                  <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${isThisPlaying ? bar3 : 14}px` }} />
                  <div className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${isThisPlaying ? bar4 : 5}px` }} />
                </div>
                <span className="text-[11px] font-bold truncate max-w-[150px]">
                  {track.title} • {track.artist}
                </span>
              </div>
            </div>

            {/* Bottom Lyric Preview & Story Action */}
            <div className="relative z-10 text-center space-y-1">
              <p className="text-xs text-white/90 font-medium italic drop-shadow line-clamp-1">
                "{track.lyrics?.[0] || 'Listen to this sound on SoundWave'}"
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-md">
                  USE THIS SOUND IN REELS
                </span>
              </div>
            </div>
          </div>

          {/* Original Track Metadata Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Original High Quality Audio Data
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Tempo & Key</span>
                <span className="font-bold text-white">{track.bpm ? `${track.bpm} BPM` : '110 BPM'} • {track.key || 'C Minor'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Year & Mood</span>
                <span className="font-bold text-white">{track.year || '2024'} • {track.mood || track.genre}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Instagram Audio Reach</span>
                <span className="font-bold text-pink-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-pink-400" />
                  {track.igReelsCount || 'Trending Audio'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Audio Format</span>
                <span className="font-bold text-cyan-400 truncate block">
                  Lossless Master Hi-Fi
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copied ? 'Copied Template!' : 'Copy Audio Info'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenEqualizer();
              }}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20"
            >
              <Sliders className="w-4 h-4" />
              <span>Instagram EQ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
