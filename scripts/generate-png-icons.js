import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // Simple uncompressed or deflate PNG generator
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth: 8
  ihdr.writeUInt8(6, 9); // color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(4 + 4 + len + 4);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    
    // calculate crc
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      const byte = chunk[i];
      crc = updateCrc(crc, byte);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // CRC table lookup
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function updateCrc(crc, byte) {
    return crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with 1 filter byte per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.45 : 0.46);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = 10, g = 13, b = 20, a = 255;

      if (!isMaskable && dist > radius) {
        // Transparent outside circle
        r = 0; g = 0; b = 0; a = 0;
      } else {
        // Inner circle background gradient
        const t = (x + y) / (width + height);
        r = Math.floor(10 + t * 8);
        g = Math.floor(13 + t * 11);
        b = Math.floor(20 + t * 18);

        // Soundwave curved arcs:
        // Arc 1: cy - 0.25*height
        // Arc 2: cy - 0.05*height
        // Arc 3: cy + 0.15*height
        const wave1Dist = Math.abs(Math.sqrt(dx * dx + (dy + height * 0.18) * (dy + height * 0.18)) - height * 0.42);
        const wave2Dist = Math.abs(Math.sqrt(dx * dx + (dy + height * 0.08) * (dy + height * 0.08)) - height * 0.32);
        const wave3Dist = Math.abs(Math.sqrt(dx * dx + (dy - height * 0.02) * (dy - height * 0.02)) - height * 0.22);

        const inAngle = Math.abs(dx) < width * 0.35 && dy < height * 0.25;

        const th = width * 0.038;
        if (inAngle && (wave1Dist < th || wave2Dist < th || wave3Dist < th)) {
          // Vibrant Cyan Wave #00F0FF -> #06B6D4
          r = 0;
          g = Math.floor(240 - t * 40);
          b = 255;
          a = 255;
        }

        // Center dot
        const dotDist = Math.sqrt(dx * dx + (dy - height * 0.28) * (dy - height * 0.28));
        if (dotDist < width * 0.025) {
          r = 0;
          g = 240;
          b = 255;
          a = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, false));

console.log('Successfully generated PWA and iOS PNG icons!');
