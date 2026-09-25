import React, { useState } from 'react';
import { X, Laptop, Smartphone, Speaker, Tablet, QrCode, Check, RefreshCw, Radio, Sparkles, Wifi } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { PairedDevice } from '../../types/music';

interface SoundWaveConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundWaveConnectModal: React.FC<SoundWaveConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    deviceName,
    pairingCode,
    pairedDevices,
    activeDevice,
    setActiveDevice,
    pairDeviceWithCode
  } = useSync();

  const [inputCode, setInputCode] = useState('');
  const [pairError, setPairError] = useState(false);
  const [pairSuccess, setPairSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const ok = pairDeviceWithCode(inputCode);
    if (ok) {
      setPairSuccess(true);
      setInputCode('');
      setTimeout(() => setPairSuccess(false), 3000);
    } else {
      setPairError(true);
      setTimeout(() => setPairError(false), 3000);
    }
  };

  const getDeviceIcon = (type: PairedDevice['type']) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-indigo-400" />;
      case 'speaker': return <Speaker className="w-5 h-5 text-emerald-400" />;
      default: return <Laptop className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-cyan-500/30 text-white shadow-2xl shadow-cyan-950/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Laptop className="w-5 h-5 text-black font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SoundWave Connect
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">Cross-Platform Sync & Remote Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Listening On Banner */}
          <div className="rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/40 p-4">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Currently Listening On
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getDeviceIcon(activeDevice.type)}
                <div>
                  <h4 className="font-bold text-sm text-white">{activeDevice.name}</h4>
                  <p className="text-xs text-slate-400">Seamless real-time audio sync active</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Active
              </span>
            </div>
          </div>

          {/* Available Devices List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Another Device to Stream
            </h4>
            <div className="space-y-2">
              {pairedDevices.map((device) => {
                const isCurrent = activeDevice.id === device.id;
                return (
                  <div
                    key={device.id}
                    onClick={() => setActiveDevice(device)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      isCurrent
                        ? 'bg-slate-800/90 border-cyan-400/80 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-800/80">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                          {device.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {device.lastActive} {device.batteryLevel ? `• ⚡ ${device.batteryLevel}%` : ''}
                        </p>
                      </div>
                    </div>
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                        <Check className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition">
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* This Device's Pair Code Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">This Device Pair PIN:</span>
              <span className="text-xl font-mono font-extrabold text-cyan-300 tracking-wider">
                {pairingCode}
              </span>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/30 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQR ? 'Hide QR' : 'Phone QR'}</span>
            </button>
          </div>

          {/* Quick QR display if toggled */}
          {showQR && (
            <div className="p-4 rounded-xl bg-white text-black flex flex-col items-center text-center space-y-2">
              <span className="text-xs font-bold text-slate-800">Scan to pair mobile phone with SoundWave</span>
              <div className="w-36 h-36 border-2 border-cyan-500 p-2 rounded-lg flex items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Sync PIN: {pairingCode}</span>
            </div>
          )}

          {/* Pair New Device Form */}
          <form onSubmit={handlePairSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pair with another device code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SW-1234"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 bg-slate-900 text-sm text-white placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-400 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-md shadow-cyan-500/25 transition active:scale-95 shrink-0"
              >
                Pair Device
              </button>
            </div>
            {pairSuccess && (
              <p className="text-xs text-emerald-400 font-medium">Device paired successfully! Playback synced.</p>
            )}
            {pairError && (
              <p className="text-xs text-rose-400 font-medium">Please enter a valid code format (e.g. SW-4920).</p>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Automatic multi-tab & mobile peer sync enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
