import { Track, Artist } from '../types/music';

const APP_NAME = 'SoundWave';
const DEFAULT_HOST = 'https://api.audius.co';

let cachedHost: string | null = null;

// Resolve healthy Audius host
export async function getAudiusHost(): Promise<string> {
  if (cachedHost) return cachedHost;
  try {
    const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(3500) });
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      cachedHost = json.data[0];
      return cachedHost!;
    }
  } catch (err) {
    console.warn('Audius host discovery timeout, using default:', err);
  }
  cachedHost = DEFAULT_HOST;
  return DEFAULT_HOST;
}

export function detectLanguage(title: string, genre: string, artist: string): 'Hindi' | 'Marathi' | 'English' | 'Regional' {
  const combined = `${title} ${genre} ${artist}`.toLowerCase();
  if (
    combined.includes('marathi') ||
    combined.includes('lavani') ||
    combined.includes('abhang') ||
    combined.includes('natyasangeet') ||
    combined.includes('bhavgeet') ||
    combined.includes('dhol tasha') ||
    combined.includes('ajay atul') ||
    combined.includes('zingaat') ||
    combined.includes('sairat') ||
    combined.includes('vithu') ||
    combined.includes('mauli')
  ) {
    return 'Marathi';
  }

  if (
    combined.includes('hindi') ||
    combined.includes('bollywood') ||
    combined.includes('desi') ||
    combined.includes('sufi') ||
    combined.includes('punjabi') ||
    combined.includes('arijit') ||
    combined.includes('atif') ||
    combined.includes('shreya') ||
    combined.includes('ghazal') ||
    combined.includes('qawwali') ||
    combined.includes('bhangra')
  ) {
    return 'Hindi';
  }

  return 'English';
}

export function transformAudiusTrack(t: any, host: string): Track {
  const artwork = t.artwork?.['480x480'] || 
                  t.artwork?.['150x150'] || 
                  t.artwork?.['1000x1000'] || 
                  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80';

  const streamUrl = `${host}/v1/tracks/${t.id}/stream?app_name=${APP_NAME}`;
  const detectedLang = detectLanguage(t.title || '', t.genre || '', t.user?.name || '');

  return {
    id: `audius-${t.id}`,
    title: t.title || 'Untitled Track',
    artist: t.user?.name || 'Unknown Artist',
    artistId: `artist-${t.user?.id || 'audius'}`,
    album: t.genre ? `${t.genre} Hits` : 'Audius Release',
    albumArt: artwork,
    duration: Math.max(30, t.duration || 180),
    audioUrl: streamUrl,
    genre: t.genre || (detectedLang === 'Hindi' ? 'Bollywood' : detectedLang === 'Marathi' ? 'Marathi Folk' : 'Electronic'),
    plays: t.play_count || 12500,
    addedAt: 'Trending on Audius',
    accentColor: detectedLang === 'Hindi' ? '#F97316' : detectedLang === 'Marathi' ? '#E11D48' : '#00F0FF',
    source: 'Audius Music Network (Open Web3 Audio)',
    sourceUrl: `https://audius.co/${t.user?.handle || ''}`,
    language: detectedLang,
    lyrics: [
      `Streamed via Audius Open Network`,
      `Track: ${t.title}`,
      `Artist: ${t.user?.name}`,
      `Language: ${detectedLang}`,
      `Listen to high-fidelity decentralized music on SoundWave`
    ]
  };
}

export function transformAudiusArtist(u: any): Artist {
  return {
    id: `artist-${u.id}`,
    name: u.name || 'Audius Creator',
    avatar: u.profile_picture?.['480x480'] || u.profile_picture?.['150x150'] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80',
    coverImage: u.cover_photo?.['2000x'] || u.cover_photo?.['640x'] || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400&auto=format&fit=crop&q=80',
    monthlyListeners: (u.follower_count || 1200) * 14,
    verified: u.is_verified || false,
    bio: u.bio || `Creator on the Audius network. Stream their tracks on SoundWave.`,
    popularTrackIds: []
  };
}

// Fetch trending tracks from Audius
export async function fetchTrendingTracks(genre?: string, limit = 25): Promise<Track[]> {
  try {
    const host = await getAudiusHost();
    const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
    const url = `${host}/v1/tracks/trending?app_name=${APP_NAME}&limit=${limit}${genreParam}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Audius trending responded ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map((t: any) => transformAudiusTrack(t, host));
    }
  } catch (err) {
    console.warn('Failed to fetch Audius trending tracks:', err);
  }
  return [];
}

// Fetch Indian tracks (Hindi, Bollywood, Marathi, Punjabi)
export async function fetchIndianRegionalTracks(limit = 20): Promise<Track[]> {
  try {
    const host = await getAudiusHost();
    const queries = ['hindi', 'bollywood', 'marathi', 'punjabi'];
    const results = await Promise.all(
      queries.map(async (q) => {
        try {
          const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=${APP_NAME}&limit=6`, {
            signal: AbortSignal.timeout(4000)
          });
          const json = await res.json();
          return json.data || [];
        } catch {
          return [];
        }
      })
    );

    const merged: any[] = [];
    const seen = new Set<string>();
    for (const group of results) {
      for (const t of group) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          merged.push(t);
        }
      }
    }

    return merged.slice(0, limit).map((t) => transformAudiusTrack(t, host));
  } catch (err) {
    console.warn('Failed to fetch Indian regional tracks:', err);
    return [];
  }
}

// Live search tracks on Audius
export async function searchAudiusTracks(query: string, limit = 20): Promise<Track[]> {
  if (!query || !query.trim()) return [];
  try {
    const host = await getAudiusHost();
    const url = `${host}/v1/tracks/search?query=${encodeURIComponent(query.trim())}&app_name=${APP_NAME}&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) throw new Error(`Audius search responded ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map((t: any) => transformAudiusTrack(t, host));
    }
  } catch (err) {
    console.warn('Audius search error:', err);
  }
  return [];
}

// Search users / artists on Audius
export async function searchAudiusArtists(query: string, limit = 6): Promise<Artist[]> {
  if (!query || !query.trim()) return [];
  try {
    const host = await getAudiusHost();
    const url = `${host}/v1/users/search?query=${encodeURIComponent(query.trim())}&app_name=${APP_NAME}&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) throw new Error(`Audius user search responded ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data)) {
      return json.data.map((u: any) => transformAudiusArtist(u));
    }
  } catch (err) {
    console.warn('Audius artist search error:', err);
  }
  return [];
}
