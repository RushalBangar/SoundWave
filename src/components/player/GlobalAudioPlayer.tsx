import React from 'react';
import { useMusic } from '../../context/MusicContext';

interface GlobalAudioPlayerProps {
  onAddCustomTrack?: (urlOrId: string) => void;
}

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = () => {
  const { currentTrack, isPlaying } = useMusic();

  const activeVideoId = currentTrack.youtubeId || 'BddP6PYo2gs';

  // If paused and no active track, unmount iframe
  if (!isPlaying && !currentTrack.youtubeId) {
    return null;
  }

  return (
    // Audio-only background engine: completely invisible, no visuals, pure high-fidelity sound
    <div 
      aria-hidden="true"
      className="fixed -top-[9999px] -left-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden"
    >
      <iframe
        key={activeVideoId}
        src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=${isPlaying ? '1' : '0'}&enablejsapi=1&controls=0&playsinline=1`}
        title={currentTrack.title}
        className="w-1 h-1 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />
    </div>
  );
};
