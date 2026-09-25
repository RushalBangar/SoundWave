import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PairedDevice } from '../types/music';

interface SyncMessage {
  type: 'PLAY_TRACK' | 'PLAY_PAUSE' | 'SEEK' | 'VOLUME' | 'DEVICE_ANNOUNCE' | 'PAIR_REQUEST';
  senderDeviceId: string;
  senderName: string;
  trackId?: string;
  isPlaying?: boolean;
  currentTime?: number;
  volume?: number;
  timestamp: number;
}

interface SyncContextType {
  deviceId: string;
  deviceName: string;
  pairingCode: string;
  pairedDevices: PairedDevice[];
  activeDevice: PairedDevice;
  setActiveDevice: (device: PairedDevice) => void;
  broadcastPlayback: (trackId: string, isPlaying: boolean, currentTime: number) => void;
  broadcastPlayPause: (isPlaying: boolean) => void;
  broadcastSeek: (time: number) => void;
  pairDeviceWithCode: (code: string) => boolean;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  recentSyncActivity: string | null;
}

const SyncContext = createContext<SyncContextType | null>(null);

const STORAGE_KEY_DEVICE_ID = 'soundwave_device_id';
const STORAGE_KEY_DEVICE_NAME = 'soundwave_device_name';
const STORAGE_KEY_PAIR_CODE = 'soundwave_pair_code';

export const SyncProvider: React.FC<{
  children: React.ReactNode;
  onRemoteTrackChange?: (trackId: string) => void;
  onRemotePlayPause?: (isPlaying: boolean) => void;
  onRemoteSeek?: (time: number) => void;
}> = ({ children, onRemoteTrackChange, onRemotePlayPause, onRemoteSeek }) => {
  const [deviceId] = useState(() => {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    return id;
  });

  const [deviceName] = useState(() => {
    let name = localStorage.getItem(STORAGE_KEY_DEVICE_NAME);
    if (!name) {
      const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
      name = isMobile ? 'Mobile SoundWave Player' : 'Web Player (This Browser)';
      localStorage.setItem(STORAGE_KEY_DEVICE_NAME, name);
    }
    return name;
  });

  const [pairingCode] = useState(() => {
    let code = localStorage.getItem(STORAGE_KEY_PAIR_CODE);
    if (!code) {
      code = 'SW-' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem(STORAGE_KEY_PAIR_CODE, code);
    }
    return code;
  });

  const thisDevice: PairedDevice = useMemo(() => ({
    id: deviceId,
    name: deviceName,
    type: /iphone|android/i.test(navigator.userAgent) ? 'smartphone' : 'computer',
    isCurrent: true,
    lastActive: 'Now'
  }), [deviceId, deviceName]);

  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([
    {
      id: 'phone-sync-1',
      name: 'iPhone 16 Pro (SoundWave App)',
      type: 'smartphone',
      isCurrent: false,
      batteryLevel: 88,
      lastActive: 'Ready to stream'
    },
    {
      id: 'tab-sync-2',
      name: 'iPad Pro (Studio Desk)',
      type: 'tablet',
      isCurrent: false,
      batteryLevel: 94,
      lastActive: 'Online'
    },
    {
      id: 'speaker-sync-3',
      name: 'Living Room Hi-Fi SoundBar',
      type: 'speaker',
      isCurrent: false,
      lastActive: 'Connected'
    }
  ]);

  const [activeDevice, setActiveDevice] = useState<PairedDevice>(thisDevice);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [recentSyncActivity, setRecentSyncActivity] = useState<string | null>(null);

  // Cross-tab and Cross-window BroadcastChannel sync
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('soundwave_cross_platform_sync');
        channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          const msg = event.data;
          if (!msg || msg.senderDeviceId === deviceId) return;

          if (msg.type === 'PLAY_TRACK' && msg.trackId && onRemoteTrackChange) {
            setRecentSyncActivity(`Syncing with ${msg.senderName}`);
            onRemoteTrackChange(msg.trackId);
          } else if (msg.type === 'PLAY_PAUSE' && msg.isPlaying !== undefined && onRemotePlayPause) {
            onRemotePlayPause(msg.isPlaying);
          } else if (msg.type === 'SEEK' && msg.currentTime !== undefined && onRemoteSeek) {
            onRemoteSeek(msg.currentTime);
          }
        };

        // Announce presence
        channel.postMessage({
          type: 'DEVICE_ANNOUNCE',
          senderDeviceId: deviceId,
          senderName: deviceName,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this frame', e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, [deviceId, deviceName, onRemoteTrackChange, onRemotePlayPause, onRemoteSeek]);

  const broadcastPlayback = (trackId: string, isPlaying: boolean, currentTime: number) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('soundwave_cross_platform_sync');
        channel.postMessage({
          type: 'PLAY_TRACK',
          senderDeviceId: String(deviceId),
          senderName: String(deviceName),
          trackId: String(trackId),
          isPlaying: Boolean(isPlaying),
          currentTime: Number(currentTime) || 0,
          timestamp: Date.now()
        });
        channel.close();
      }
    } catch {
      // Ignore
    }
  };

  const broadcastPlayPause = (isPlaying: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('soundwave_cross_platform_sync');
        channel.postMessage({
          type: 'PLAY_PAUSE',
          senderDeviceId: String(deviceId),
          senderName: String(deviceName),
          isPlaying: Boolean(isPlaying),
          timestamp: Date.now()
        });
        channel.close();
      }
    } catch {
      // Ignore
    }
  };

  const broadcastSeek = (time: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('soundwave_cross_platform_sync');
        channel.postMessage({
          type: 'SEEK',
          senderDeviceId: String(deviceId),
          senderName: String(deviceName),
          currentTime: typeof time === 'number' && !isNaN(time) ? time : 0,
          timestamp: Date.now()
        });
        channel.close();
      }
    } catch {
      // Ignore
    }
  };

  const pairDeviceWithCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean.startsWith('SW-') && clean.length < 4) return false;

    const newDevice: PairedDevice = {
      id: 'custom-' + Date.now(),
      name: `Synced Device (${clean})`,
      type: 'smartphone',
      isCurrent: false,
      lastActive: 'Just paired'
    };

    setPairedDevices(prev => [newDevice, ...prev]);
    setRecentSyncActivity(`Paired successfully with ${clean}`);
    setTimeout(() => setRecentSyncActivity(null), 4000);
    return true;
  };

  return (
    <SyncContext.Provider
      value={{
        deviceId,
        deviceName,
        pairingCode,
        pairedDevices: [thisDevice, ...pairedDevices],
        activeDevice,
        setActiveDevice,
        broadcastPlayback,
        broadcastPlayPause,
        broadcastSeek,
        pairDeviceWithCode,
        isConnectModalOpen,
        setIsConnectModalOpen,
        recentSyncActivity
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
