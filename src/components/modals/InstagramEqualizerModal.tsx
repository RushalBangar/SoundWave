import React, { useState, useEffect } from 'react';
import { X, Sliders, Sparkles, Volume2, RotateCcw, Check, Radio, Flame, Music, Disc } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { INSTAGRAM_EQ_PRESETS, EqualizerPreset } from '../../audio/AudioEngine';

interface InstagramEqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstagramEqualizerModal: React.FC<InstagramEqualizerModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack, isPlaying, audioEngine, frequencyData } = useMusic();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(audioEngine.getCurrentPresetId() || 'ig-reel-bass');
  const [bands, setBands] = useState<[number, number, number, number, number]>(audioEngine.getEqGains());
  const [activeVisualizerMode, setActiveVisualizerMode] = useState<'ig-sticker' | 'reels-wave' | 'vinyl'>('ig-sticker');

  useEffect(() => {
    if (isOpen) {
      setSelectedPresetId(audioEngine.getCurrentPresetId());
      setBands(audioEngine.getEqGains());
    }
  }, [isOpen, audioEngine]);

  if (!isOpen) return null;

  const bandLabels = [
    { freq: '60 Hz', name: 'Sub Bass', desc: 'Kick & 808s' },
    { freq: '250 Hz', name: 'Bass Punch', desc: 'Warmth' },
    { freq: '1 kHz', name: 'Vocal Mid', desc: 'Presence' },
    { freq: '4 kHz', name: 'Crispness', desc: 'Clarity' },
    { freq: '16 kHz', name: 'Air & Shimmer', desc: 'Hi-Hats' }
  ];

  const handlePresetSelect = (preset: EqualizerPreset) => {
    setSelectedPresetId(preset.id);
    setBands(preset.bands);
    audioEngine.setEqPreset(preset.id);
  };

  const handleBandChange = (index: number, val: number) => {
    const updated = [...bands] as [number, number, number, number, number];
    updated[index] = val;
    setBands(updated);
    audioEngine.setEqBands(updated);
    setSelectedPresetId('custom');
  };

  const handleReset = () => {
    const flat: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    setBands(flat);
    audioEngine.setEqBands(flat);
    setSelectedPresetId('studio-master');
  };

  const handleApplyBestInstagram = () => {
    const best = INSTAGRAM_EQ_PRESETS[0]; // ig-reel-bass
    handlePresetSelect(best);
  };

  // 4 Instagram Audio Sticker jumping bars
  const bar1 = Math.max(15, (frequencyData[2] || 60) / 2.5);
  const bar2 = Math.max(25, (frequencyData[6] || 120) / 2.5);
  const bar3 = Math.max(20, (frequencyData[12] || 180) / 2.5);
  const bar4 = Math.max(12, (frequencyData[18] || 80) / 2.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-[#0d131f] border border-pink-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Instagram Header Gradient Bar */}
        <div className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black tracking-tight">
                  Instagram Audio Equalizer
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-bold tracking-wide border border-white/20 uppercase">
                  Best Audio Tuning
                </span>
              </div>
              <p className="text-xs text-white/90">
                Calibrated for Instagram Reels, Stories & mobile stereo speakers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Live Visualizer Showcase */}
          <div className="p-4 rounded-2xl bg-[#121927] border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

            {/* Visualizer Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs mb-4 z-10">
              <button
                onClick={() => setActiveVisualizerMode('ig-sticker')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeVisualizerMode === 'ig-sticker' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                IG Story Sticker
              </button>
              <button
                onClick={() => setActiveVisualizerMode('reels-wave')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeVisualizerMode === 'reels-wave' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Reels Waveform
              </button>
              <button
                onClick={() => setActiveVisualizerMode('vinyl')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeVisualizerMode === 'vinyl' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Spinning Vinyl Disc
              </button>
            </div>

            {/* Mode 1: Instagram Audio Sticker preview */}
            {activeVisualizerMode === 'ig-sticker' && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:scale-105 transition-transform duration-200">
                {/* 4 Instagram Jumping Bars */}
                <div className="flex items-end gap-1 h-6 w-7 justify-center">
                  <div 
                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                    style={{ height: `${isPlaying ? bar1 : 8}px` }}
                  />
                  <div 
                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                    style={{ height: `${isPlaying ? bar2 : 14}px` }}
                  />
                  <div 
                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                    style={{ height: `${isPlaying ? bar3 : 18}px` }}
                  />
                  <div 
                    className="w-1.5 bg-white rounded-full transition-all duration-75"
                    style={{ height: `${isPlaying ? bar4 : 6}px` }}
                  />
                </div>

                <div className="text-xs font-semibold max-w-[260px] truncate">
                  <span className="font-extrabold">{currentTrack.title}</span>
                  <span className="opacity-70 mx-1">•</span>
                  <span className="opacity-90">{currentTrack.artist}</span>
                  <span className="opacity-60 text-[10px] ml-1.5">Original Audio</span>
                </div>
              </div>
            )}

            {/* Mode 2: Full Reels Spectrum */}
            {activeVisualizerMode === 'reels-wave' && (
              <div className="flex items-end justify-center gap-1.5 h-16 w-full px-4">
                {Array.from(frequencyData.slice(0, 20)).map((val, idx) => {
                  const h = isPlaying ? Math.max(6, Math.min(60, val / 4)) : 8;
                  return (
                    <div
                      key={idx}
                      className="w-2 rounded-full bg-gradient-to-t from-[#833ab4] via-[#fd1d1d] to-[#fcb045] transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            )}

            {/* Mode 3: Spinning Vinyl */}
            {activeVisualizerMode === 'vinyl' && (
              <div className="flex items-center gap-4 py-2">
                <div className={`relative w-14 h-14 rounded-full border-2 border-slate-700 overflow-hidden shadow-xl ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                  <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-black border border-white/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[200px]">{currentTrack.title}</p>
                  <p className="text-xs text-pink-400 font-medium">{currentTrack.igReelsCount || 'Trending Audio'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Instagram & Sound Presets
              </label>
              <button
                onClick={handleApplyBestInstagram}
                className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition underline flex items-center gap-1"
              >
                Set as Instagram Reel (Default)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INSTAGRAM_EQ_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                        {preset.description}
                      </p>
                    </div>

                    {preset.badge && (
                      <span className="mt-2 inline-block self-start text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {preset.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Band Hardware Sliders */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                5-Band Hardware Equalizer (-12dB to +12dB)
              </label>
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset (Flat)
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              {bandLabels.map((band, idx) => (
                <div key={band.freq} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    {bands[idx] > 0 ? `+${bands[idx]}` : bands[idx]} dB
                  </span>

                  {/* Vertical Slider */}
                  <div className="relative h-28 flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={bands[idx]}
                      onChange={(e) => handleBandChange(idx, parseInt(e.target.value, 10))}
                      className="h-28 w-2 accent-pink-500 cursor-pointer appearance-none bg-slate-800 rounded-full [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>

                  <span className="text-xs font-bold text-white text-center leading-none mt-1">
                    {band.freq}
                  </span>
                  <span className="text-[9px] text-slate-500 text-center leading-tight">
                    {band.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0a0f19] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Active: <strong className="text-pink-400">{INSTAGRAM_EQ_PRESETS.find(p => p.id === selectedPresetId)?.name || 'Custom Curve'}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-pink-500/25 transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
