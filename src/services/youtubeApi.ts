import { Track, Artist } from '../types/music';

// Helper to extract 11-char video ID from any YouTube URL or text
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Regex for full URLs, shorts, embed URLs, youtu.be
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = clean.match(regex);
  return match && match[1] ? match[1] : null;
}

export function detectLanguage(title: string, artist: string): 'Hindi' | 'Marathi' | 'English' | 'Regional' {
  const combined = `${title} ${artist}`.toLowerCase();
  if (
    combined.includes('marathi') ||
    combined.includes('lavani') ||
    combined.includes('abhang') ||
    combined.includes('zingaat') ||
    combined.includes('sairat') ||
    combined.includes('ajay atul') ||
    combined.includes('mauli') ||
    combined.includes('natrang') ||
    combined.includes('shankar mahadevan') ||
    combined.includes('bhavgeet')
  ) {
    return 'Marathi';
  }

  if (
    combined.includes('hindi') ||
    combined.includes('bollywood') ||
    combined.includes('arijit') ||
    combined.includes('jubin') ||
    combined.includes('shreya') ||
    combined.includes('pritam') ||
    combined.includes('t-series') ||
    combined.includes('atif') ||
    combined.includes('sufi') ||
    combined.includes('sonu') ||
    combined.includes('alka yagnik') ||
    combined.includes('neha kakkar') ||
    combined.includes('badshah')
  ) {
    return 'Hindi';
  }

  return 'English';
}

export function detectGenre(title: string, artist: string): string {
  const combined = `${title} ${artist}`.toLowerCase();
  if (combined.includes('marathi')) return 'Marathi Dhol Tasha';
  if (combined.includes('lofi') || combined.includes('lo-fi') || combined.includes('chill')) return 'Lo-Fi Study Beats';
  if (combined.includes('romantic') || combined.includes('love') || combined.includes('kesariya')) return 'Bollywood Romantic';
  if (combined.includes('dance') || combined.includes('party') || combined.includes('club')) return 'Club Dance';
  if (combined.includes('pop')) return 'Pop';
  if (combined.includes('rock')) return 'Rock';
  return 'YouTube Hit';
}

// Transform YouTube API video item to SoundWave Track
export function transformYouTubeVideo(item: any): Track {
  const lang = detectLanguage(item.title, item.artist);
  const genre = detectGenre(item.title, item.artist);

  return {
    id: `yt-${item.id}`,
    title: item.title,
    artist: item.artist || item.channelName || 'YouTube Artist',
    artistId: `artist-yt-${encodeURIComponent(item.artist || 'youtube')}`,
    album: item.channelName ? `${item.channelName} • YouTube` : 'YouTube Music',
    albumArt: item.maxresThumbnail || item.thumbnail || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
    duration: item.durationSeconds || 240,
    audioUrl: '', // Pure YouTube live streaming
    genre,
    language: lang,
    youtubeId: item.id,
    youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`,
    bpm: lang === 'Marathi' ? 128 : lang === 'Hindi' ? 98 : 110,
    key: 'C Major',
    plays: typeof item.views === 'string' ? 1500000 : item.views || 250000,
    addedAt: 'Trending on YouTube',
    accentColor: lang === 'Marathi' ? '#E11D48' : lang === 'Hindi' ? '#F97316' : '#00F0FF',
    source: 'YouTube Official Music',
    sourceUrl: `https://www.youtube.com/watch?v=${item.id}`
  };
}

// 1. Live Search on YouTube Catalog
export async function searchYouTubeTracks(query: string, limit = 20): Promise<Track[]> {
  if (!query || !query.trim()) return [];

  // Check if input is a direct YouTube link
  const directId = extractYouTubeId(query);
  if (directId) {
    const single = await getYouTubeTrackFromIdOrUrl(directId);
    if (single) return [single];
  }

  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`, {
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.videos && Array.isArray(json.videos)) {
        return json.videos.map(transformYouTubeVideo);
      }
    }
  } catch (err) {
    console.warn('Backend YouTube search endpoint unavailable, using oEmbed fallback:', err);
  }

  return [];
}

// 2. Fetch single video metadata from YouTube
export async function getYouTubeTrackFromIdOrUrl(input: string): Promise<Track | null> {
  const videoId = extractYouTubeId(input);
  if (!videoId) return null;

  try {
    const res = await fetch(`/api/youtube/metadata?id=${encodeURIComponent(videoId)}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      return transformYouTubeVideo(data);
    }
  } catch (err) {
    console.warn('Metadata proxy error, attempting client-side oEmbed:', err);
  }

  // Client-side oEmbed fallback
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      return transformYouTubeVideo({
        id: videoId,
        title: oembed.title,
        artist: oembed.author_name,
        channelName: oembed.author_name,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        durationSeconds: 240
      });
    }
  } catch {
    // If oEmbed fails, return minimal valid YouTube track
  }

  return {
    id: `yt-${videoId}`,
    title: `YouTube Song (${videoId})`,
    artist: 'YouTube Creator',
    artistId: 'artist-youtube',
    album: 'YouTube Stream',
    albumArt: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration: 240,
    audioUrl: '',
    genre: 'YouTube Music',
    language: 'Hindi',
    youtubeId: videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    plays: 500000,
    addedAt: 'Just now',
    accentColor: '#FF0000',
    source: 'YouTube Official Music',
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
}

// 3. Trending YouTube Tracks
export async function fetchTrendingYouTubeTracks(category = 'trending songs 2026', limit = 20): Promise<Track[]> {
  return searchYouTubeTracks(category, limit);
}

// 4. Bollywood / Hindi Songs on YouTube
export async function fetchBollywoodYouTubeTracks(limit = 15): Promise<Track[]> {
  return searchYouTubeTracks('latest bollywood hindi songs 2026', limit);
}

// 5. Marathi Hit Songs on YouTube
export async function fetchMarathiYouTubeTracks(limit = 15): Promise<Track[]> {
  return searchYouTubeTracks('top marathi songs zingaat hits', limit);
}

// 6. Global Billboard Hits on YouTube
export async function fetchGlobalYouTubeTracks(limit = 15): Promise<Track[]> {
  return searchYouTubeTracks('billboard top hot 100 songs', limit);
}
