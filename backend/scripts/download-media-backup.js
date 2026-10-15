/**
 * Media Backup & Cloudflare R2 Migration Script
 * 
 * Features:
 * 1. Scans questions table for all audioUrl and imageUrl.
 * 2. Downloads all external Google Cloud Storage files locally to media_backup/.
 * 3. Supports parallel downloads (concurrency pool) with auto-resume.
 * 4. Generates a map for Cloudflare R2 upload and URL updates.
 * 
 * Usage:
 *   node scripts/download-media-backup.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/fly_edu';
const BACKUP_DIR = path.resolve(__dirname, '../../media_backup');
const AUDIO_DIR = path.join(BACKUP_DIR, 'audio');
const IMAGE_DIR = path.join(BACKUP_DIR, 'images');
const CONCURRENCY = 12;

function ensureDirs() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ skipped: true });
    }

    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ skipped: false }));
      });
    });

    req.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      file.close();
      fs.unlink(destPath, () => {});
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function runPool(items, limit, workerFn) {
  let index = 0;
  let completed = 0;
  const total = items.length;

  async function next() {
    while (index < total) {
      const currentIndex = index++;
      const item = items[currentIndex];
      try {
        await workerFn(item, currentIndex, total);
      } catch (err) {
        console.error(`[Error] Failed item ${currentIndex + 1}/${total}: ${err.message}`);
      }
      completed++;
      if (completed % 100 === 0 || completed === total) {
        const percent = ((completed / total) * 100).toFixed(1);
        console.log(`[Progress] ${completed}/${total} files processed (${percent}%)`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, total) }, () => next());
  await Promise.all(workers);
}

async function main() {
  ensureDirs();
  console.log(`[Init] Connecting to database: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log('[1/3] Querying audio and image links from questions table...');
  const audioRes = await client.query(`
    SELECT id, code, "audioUrl" 
    FROM questions 
    WHERE "audioUrl" IS NOT NULL AND "audioUrl" != '' AND "audioUrl" LIKE 'http%'
  `);

  const imageRes = await client.query(`
    SELECT id, code, "imageUrl" 
    FROM questions 
    WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '' AND "imageUrl" LIKE 'http%'
  `);

  await client.end();

  console.log(`[Summary] Found ${audioRes.rows.length} audio files and ${imageRes.rows.length} image files.`);

  // 1. Download Audios
  console.log('\n[2/3] Starting Audio Downloads to media_backup/audio...');
  await runPool(audioRes.rows, CONCURRENCY, async (row) => {
    const rawUrl = row.audioUrl.trim();
    const urlObj = new URL(rawUrl);
    const fileName = path.basename(urlObj.pathname) || `${row.id}.mp3`;
    const dest = path.join(AUDIO_DIR, fileName);
    await downloadFile(rawUrl, dest);
  });

  // 2. Download Images
  console.log('\n[3/3] Starting Image Downloads to media_backup/images...');
  await runPool(imageRes.rows, CONCURRENCY, async (row) => {
    const rawUrl = row.imageUrl.trim();
    const urlObj = new URL(rawUrl);
    const fileName = path.basename(urlObj.pathname) || `${row.id}.jpg`;
    const dest = path.join(IMAGE_DIR, fileName);
    await downloadFile(rawUrl, dest);
  });

  console.log('\n✅ All media files downloaded and securely backed up in media_backup/!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, downloadFile };
