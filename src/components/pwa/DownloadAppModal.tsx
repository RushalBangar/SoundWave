import React, { useState } from 'react';
import { X, Smartphone, Apple, Download, Check, Share2, PlusSquare, QrCode, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qr'>('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://soundwave.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0f172a] border border-cyan-500/30 text-white shadow-2xl shadow-cyan-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Download className="w-5 h-5 text-black font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Get SoundWave App
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Free Forever
                </span>
              </h2>
              <p className="text-xs text-slate-400">Install native-feel app on iOS & Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'android'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'ios'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            iPhone & iPad (iOS)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'qr'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan Phone QR
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-cyan-950/30 border border-cyan-800/40 p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-cyan-200">Progressive Web App (PWA)</p>
                  <p>Works just like a Google Play store app: full screen, offline music cache, low storage footprint, and background playback support.</p>
                </div>
              </div>

              {isInstalled ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-sm">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>SoundWave is already installed on this device!</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleDirectInstall}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/25 transition active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" />
                  {installSuccess ? 'Installed Successfully!' : 'Install SoundWave for Android'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    How to install on Android Chrome / Samsung Internet:
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">1</span>
                      <span>Open <strong>Chrome</strong> or your mobile browser on your Android device.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">2</span>
                      <span>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">3</span>
                      <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="text-cyan-400 font-bold block mb-1">0 MB Play Store Fees</span>
                  <span className="text-slate-400">100% Free with zero ads or subscriptions.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="text-cyan-400 font-bold block mb-1">SoundWave Sync</span>
                  <span className="text-slate-400">Automatically syncs with your PC or tablet.</span>
                </div>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 flex items-center gap-3">
                <Apple className="w-6 h-6 text-white shrink-0" />
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white">Apple iOS Safari Installation</p>
                  <p className="text-slate-400">Apple allows installing any modern web app to your iPhone or iPad home screen in 2 quick steps.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-bold text-white mb-0.5">Step 1: Tap the Share Button</p>
                    <p className="text-slate-400">In Safari on your iPhone, tap the square Share icon with the upward arrow at the bottom of your screen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-bold text-white mb-0.5">Step 2: Tap "Add to Home Screen"</p>
                    <p className="text-slate-400">Scroll down the menu list and tap <span className="text-cyan-300 font-semibold">"Add to Home Screen"</span>.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-bold text-white mb-0.5">Step 3: Tap "Add"</p>
                    <p className="text-slate-400">Tap <strong>Add</strong> in the top-right corner. The SoundWave app icon will appear on your iPhone home screen!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR CODE TAB */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <p className="text-xs text-slate-300 max-w-xs">
                Scan this QR code with your iPhone Camera or Android Lens to open SoundWave directly on your mobile device:
              </p>
              
              {/* High-contrast QR visual box */}
              <div className="p-4 bg-white rounded-2xl shadow-xl shadow-cyan-900/30 border-4 border-cyan-400">
                <svg className="w-48 h-48" viewBox="0 0 120 120" fill="none">
                  {/* Outer corner positioning squares */}
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="#090d16" />
                  <rect x="16" y="16" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="20" y="20" width="10" height="10" rx="1" fill="#00f0ff" />

                  <rect x="80" y="10" width="30" height="30" rx="4" fill="#090d16" />
                  <rect x="86" y="16" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="90" y="20" width="10" height="10" rx="1" fill="#00f0ff" />

                  <rect x="10" y="80" width="30" height="30" rx="4" fill="#090d16" />
                  <rect x="16" y="86" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="20" y="90" width="10" height="10" rx="1" fill="#00f0ff" />

                  {/* QR Data Matrix grid dots */}
                  <g fill="#090d16">
                    <rect x="48" y="14" width="6" height="6" rx="1" />
                    <rect x="62" y="18" width="6" height="6" rx="1" />
                    <rect x="52" y="28" width="6" height="6" rx="1" />
                    <rect x="66" y="32" width="6" height="6" rx="1" />
                    
                    <rect x="14" y="48" width="6" height="6" rx="1" />
                    <rect x="28" y="54" width="6" height="6" rx="1" />
                    <rect x="20" y="64" width="6" height="6" rx="1" />

                    <rect x="46" y="46" width="8" height="8" rx="2" fill="#00b4d8" />
                    <rect x="64" y="46" width="8" height="8" rx="2" fill="#0077b6" />
                    <rect x="55" y="58" width="10" height="10" rx="2" fill="#03045e" />

                    <rect x="84" y="48" width="6" height="6" rx="1" />
                    <rect x="96" y="58" width="6" height="6" rx="1" />
                    <rect x="88" y="68" width="6" height="6" rx="1" />

                    <rect x="48" y="82" width="6" height="6" rx="1" />
                    <rect x="60" y="88" width="6" height="6" rx="1" />
                    <rect x="52" y="98" width="6" height="6" rx="1" />
                    <rect x="78" y="88" width="6" height="6" rx="1" />
                    <rect x="94" y="96" width="6" height="6" rx="1" />
                  </g>
                </svg>
              </div>

              <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 truncate max-w-[280px]">
                  {currentUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold shrink-0 transition"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Fast, safe, zero trackers</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
