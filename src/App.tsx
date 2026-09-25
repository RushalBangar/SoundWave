/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { SyncProvider, useSync } from './context/SyncContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomPlayer } from './components/layout/BottomPlayer';
import { RightSidebar } from './components/layout/RightSidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { PlaylistView } from './components/views/PlaylistView';
import { ArtistView } from './components/views/ArtistView';
import { LikedSongsView } from './components/views/LikedSongsView';
import { LyricsOverlay } from './components/views/LyricsOverlay';

// Modals & PWA
import { DownloadAppModal } from './components/pwa/DownloadAppModal';
import { SoundWaveConnectModal } from './components/modals/SoundWaveConnectModal';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal';
import { MobilePlayerModal } from './components/modals/MobilePlayerModal';
import { SourcesModal } from './components/modals/SourcesModal';
import { InstagramEqualizerModal } from './components/modals/InstagramEqualizerModal';
import { InstagramTemplateModal } from './components/modals/InstagramTemplateModal';
import { GlobalAudioPlayer } from './components/player/GlobalAudioPlayer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Track } from './types/music';

const MainLayout: React.FC = () => {
  const { currentView, currentTrack, playTrack, isYouTubeVideoOpen, setIsYouTubeVideoOpen, audioEngine, isPlaying } = useMusic();
  const { isConnectModalOpen, setIsConnectModalOpen } = useSync();

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isInstagramTemplateOpen, setIsInstagramTemplateOpen] = useState(false);

  const handleToggleYouTubeVideo = () => {
    const nextState = !isYouTubeVideoOpen;
    setIsYouTubeVideoOpen(nextState);
    if (nextState) {
      audioEngine.pause();
    } else {
      if (isPlaying) {
        audioEngine.play();
      }
    }
  };

  // Play custom YouTube video entered by the user
  const handleAddCustomYouTubeTrack = (videoId: string) => {
    const customTrack: Track = {
      id: `yt-${videoId}`,
      title: `YouTube Audio (${videoId})`,
      artist: 'YouTube Creator',
      artistId: 'artist-youtube',
      album: 'YouTube Music Stream',
      albumArt: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: 240,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      genre: 'YouTube Official',
      youtubeId: videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      plays: 100000,
      addedAt: 'Just now',
      accentColor: '#FF0000',
      source: 'YouTube Official Music Video',
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      lyrics: [
        'Streamed directly via YouTube IFrame API',
        'Official Audio & Video on SoundWave'
      ]
    };
    playTrack(customTrack);
    setIsYouTubeVideoOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-[#e2e8f0]">
      {/* Spotify Left Navigation Sidebar */}
      <Sidebar
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
      />

      {/* Main Content Area + TopBar */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0c1220] md:m-2 md:ml-0 md:rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl relative">
        <TopBar
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        />

        {/* Scrollable Main View Container */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 pt-3 pb-36 md:pb-8 scrollbar-thin">
          {currentView === 'home' && <HomeView />}
          {currentView === 'search' && <SearchView />}
          {currentView === 'playlist' && <PlaylistView />}
          {currentView === 'artist' && <ArtistView />}
          {currentView === 'liked' && <LikedSongsView />}
          {currentView === 'library' && <LikedSongsView />}
        </main>
      </div>

      {/* Spotify Right Sidebar (Now Playing / Queue) */}
      <RightSidebar
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenInstagramTemplate={() => setIsInstagramTemplateOpen(true)}
        onToggleYouTubeVideo={handleToggleYouTubeVideo}
      />

      {/* Bottom Sticky Audio Player (Desktop) */}
      <div className="hidden md:block fixed bottom-0 inset-x-0 z-30">
        <BottomPlayer
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onOpenInstagramTemplate={() => setIsInstagramTemplateOpen(true)}
          onToggleYouTubeVideo={handleToggleYouTubeVideo}
          isYouTubeVideoOpen={isYouTubeVideoOpen}
        />
      </div>

      {/* Spotify Mobile Floating Mini Player + Bottom Tabs */}
      <MobileNav
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onExpandPlayer={() => setIsMobilePlayerOpen(true)}
      />

      {/* Global Audio & Video Engine (Active Continuous Player) */}
      <GlobalAudioPlayer onAddCustomTrack={handleAddCustomYouTubeTrack} />

      {/* Modals & Overlays */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      <SoundWaveConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      <MobilePlayerModal
        isOpen={isMobilePlayerOpen}
        onClose={() => setIsMobilePlayerOpen(false)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenInstagramTemplate={() => setIsInstagramTemplateOpen(true)}
        onToggleYouTubeVideo={handleToggleYouTubeVideo}
      />

      <SourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      <InstagramEqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
      />

      <InstagramTemplateModal
        isOpen={isInstagramTemplateOpen}
        onClose={() => setIsInstagramTemplateOpen(false)}
        track={currentTrack}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenYouTubeVideo={handleToggleYouTubeVideo}
      />

      <LyricsOverlay />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <SyncConsumerWrapper />
    </MusicProvider>
  );
}

// Wrapper to wire MusicContext actions to SyncProvider
const SyncConsumerWrapper: React.FC = () => {
  const { playTrack, togglePlayPause, seekTo, tracks } = useMusic();

  return (
    <SyncProvider
      onRemoteTrackChange={(trackId) => {
        const found = tracks.find(t => t.id === trackId);
        if (found) playTrack(found);
      }}
      onRemotePlayPause={(isPlaying) => {
        togglePlayPause();
      }}
      onRemoteSeek={(time) => {
        seekTo(time);
      }}
    >
      <MainLayout />
    </SyncProvider>
  );
};
