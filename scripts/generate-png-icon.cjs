const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createScissorsPng(size) {
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const radius = size * 0.42;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 10;
      let g = 10;
      let b = 10;
      let a = 255;

      if (dist >= radius - (size * 0.015) && dist <= radius) {
        r = 234; g = 179; b = 8;
      } else if (dist < radius - (size * 0.015) && dist > radius - (size * 0.04)) {
        const glow = 1 - (dist - (radius - (size * 0.04))) / (size * 0.025);
        r = Math.min(255, 10 + Math.floor(224 * glow * 0.3));
        g = Math.min(255, 10 + Math.floor(169 * glow * 0.3));
        b = Math.min(255, 10 + Math.floor(8 * glow * 0.3));
      }

      // Eye 1
      const eye1Dx = x - (cx - size * 0.16);
      const eye1Dy = y - (cy - size * 0.16);
      const eye1Dist = Math.sqrt(eye1Dx * eye1Dx + eye1Dy * eye1Dy);
      if (eye1Dist <= size * 0.085 && eye1Dist >= size * 0.045) {
        r = 250; g = 204; b = 21;
      }

      // Eye 2
      const eye2Dx = x - (cx - size * 0.16);
      const eye2Dy = y - (cy + size * 0.16);
      const eye2Dist = Math.sqrt(eye2Dx * eye2Dx + eye2Dy * eye2Dy);
      if (eye2Dist <= size * 0.085 && eye2Dist >= size * 0.045) {
        r = 250; g = 204; b = 21;
      }

      const px = x - cx;
      const py = y - cy;

      // Blade 1
      const d1 = Math.abs(px - py) / Math.sqrt(2);
      if (d1 < size * 0.024 && px >= -size * 0.12 && px <= size * 0.24 && py >= -size * 0.12 && py <= size * 0.24) {
        r = 250; g = 204; b = 21;
      }

      // Blade 2
      const d2 = Math.abs(px + py) / Math.sqrt(2);
      if (d2 < size * 0.024 && px >= -size * 0.12 && px <= size * 0.24 && py <= size * 0.12 && py >= -size * 0.24) {
        r = 250; g = 204; b = 21;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0;
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = buf.slice(4, 8 + len);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);

  return buf;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createScissorsPng(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createScissorsPng(512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createScissorsPng(180));

console.log('PNG Scissors Icons generated successfully in /public!');
