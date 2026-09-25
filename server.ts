import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Clean YouTube song titles to remove noisy tags and extract accurate Title & Artist
  function cleanYouTubeTitle(rawTitle: string): { title: string; artistSuggestion?: string } {
    let title = rawTitle || '';
    let artistSuggestion: string | undefined = undefined;

    // 1. Remove bracketed noise
    title = title.replace(/\s*[\[\(](?:Official|Music|Video|Lyrical|Audio|4K|HD|Full Song|Song|Lyrics|Visualizer|Teaser|Original).*?[\]\)]/gi, '');
    title = title.replace(/\s*\|\s*(?:Official|Music|Video|Lyrical|Audio|4K|HD|Full Song|T-Series|Sony Music|Zee Music|Tips|YRF).*$/gi, '');

    // 2. Check for "Song - Movie/Artist" or "Artist - Song"
    if (title.includes(' - ') && !title.startsWith('-')) {
      const parts = title.split(' - ');
      const part0 = parts[0].trim();
      const part1 = parts.slice(1).join(' - ').trim();

      if (part1.includes('|')) {
        title = part0;
        const subParts = part1.split('|').map(s => s.trim()).filter(Boolean);
        artistSuggestion = subParts[subParts.length - 1] || subParts[0];
      } else {
        title = part0;
        artistSuggestion = part1;
      }
    } else if (title.includes('|')) {
      const parts = title.split('|');
      title = parts[0].trim();
      if (parts.length > 1) {
        artistSuggestion = parts[parts.length - 1].trim();
      }
    }

    return {
      title: title.trim() || rawTitle,
      artistSuggestion
    };
  }

  // 1. Search YouTube Catalog API
  app.get('/api/youtube/search', async (req, res) => {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    if (!query || !query.trim()) {
      return res.json({ videos: [] });
    }

    try {
      const searchTerms = query.trim();
      const encoded = encodeURIComponent(searchTerms.toLowerCase().includes('song') || searchTerms.toLowerCase().includes('music') ? searchTerms : `${searchTerms} song`);

      const response = await fetch(`https://www.youtube.com/results?search_query=${encoded}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(6000)
      });

      const html = await response.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
      if (!match) {
        return res.json({ videos: [] });
      }

      const data = JSON.parse(match[1]);
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

      const videos: any[] = [];
      const seen = new Set<string>();

      for (const item of contents) {
        const vr = item.videoRenderer;
        if (vr && vr.videoId && !seen.has(vr.videoId)) {
          seen.add(vr.videoId);

          const rawTitle = vr.title?.runs?.[0]?.text || '';
          const owner = vr.ownerText?.runs?.[0]?.text || 'YouTube Creator';
          const durationText = vr.lengthText?.simpleText || '3:30';
          const views = vr.viewCountText?.simpleText || '';

          const { title: cleanTitle, artistSuggestion } = cleanYouTubeTitle(rawTitle);

          // Calculate duration in seconds
          const parts = durationText.split(':').map((p: string) => parseInt(p, 10));
          let durationSec = 210;
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            durationSec = parts[0] * 60 + parts[1];
          } else if (parts.length === 3) {
            durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }

          videos.push({
            id: vr.videoId,
            rawTitle,
            title: cleanTitle,
            artist: artistSuggestion || owner,
            channelName: owner,
            duration: durationText,
            durationSeconds: durationSec,
            thumbnail: `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
            maxresThumbnail: `https://i.ytimg.com/vi/${vr.videoId}/maxresdefault.jpg`,
            views
          });

          if (videos.length >= limit) break;
        }
      }

      return res.json({ videos });
    } catch (err: any) {
      console.error('YouTube search error:', err?.message);
      return res.status(500).json({ error: err?.message, videos: [] });
    }
  });

  // 2. YouTube Single Video Metadata API (oEmbed + direct extraction)
  app.get('/api/youtube/metadata', async (req, res) => {
    const id = req.query.id as string;
    if (!id || id.trim().length !== 11) {
      return res.status(400).json({ error: 'Valid 11-character video ID is required' });
    }

    const videoId = id.trim();

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) });

      if (response.ok) {
        const json = await response.json();
        const { title: cleanTitle, artistSuggestion } = cleanYouTubeTitle(json.title);

        return res.json({
          id: videoId,
          rawTitle: json.title,
          title: cleanTitle,
          artist: artistSuggestion || json.author_name || 'YouTube Music',
          channelName: json.author_name,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          authorUrl: json.author_url,
          durationSeconds: 240
        });
      }
    } catch (err) {
      console.warn('oEmbed fetch error for video:', videoId, err);
    }

    return res.json({
      id: videoId,
      rawTitle: `YouTube Track (${videoId})`,
      title: `YouTube Track (${videoId})`,
      artist: 'YouTube Music',
      channelName: 'YouTube Music',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      durationSeconds: 240
    });
  });

  // 3. Vite Middleware integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoundWave YouTube Music server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
