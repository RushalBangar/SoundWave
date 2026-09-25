import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-24 left-6 z-50 flex items-center gap-2.5 rounded-full bg-slate-900/95 border border-amber-500/40 px-4 py-2 text-xs font-medium text-amber-300 shadow-xl backdrop-blur-md">
        <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Offline Mode • SoundWave cached playback active</span>
      </div>
    );
  }

  if (showReconnectedToast) {
    return (
      <div className="fixed bottom-24 left-6 z-50 flex items-center gap-2.5 rounded-full bg-slate-900/95 border border-cyan-500/40 px-4 py-2 text-xs font-medium text-cyan-300 shadow-xl backdrop-blur-md">
        <Wifi className="w-4 h-4 text-cyan-400" />
        <span>Back Online • Full streaming restored</span>
      </div>
    );
  }

  return null;
};
