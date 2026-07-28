import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'YOUR_CLOUDFLARE_ACCOUNT_ID';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'YOUR_R2_ACCESS_KEY_ID';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'YOUR_R2_SECRET_ACCESS_KEY';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sf-uploads';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'https://docs.sf.org.pk';

let r2 = null;
if (ACCOUNT_ID !== 'YOUR_CLOUDFLARE_ACCOUNT_ID' && ACCESS_KEY_ID !== 'YOUR_R2_ACCESS_KEY_ID') {
  r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    forcePathStyle: true
  });
}

const items = [
  {
    url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/sf_logo_bg.png',
    localName: 'sf_logo_bg.png',
    r2Key: 'images/sf_logo_bg.png',
    mime: 'image/png'
  },
  {
    url: 'https://www.sf.org.pk/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-15-at-11.44.49-AM.jpeg',
    localName: 'hero_slide_1.jpg',
    r2Key: 'images/hero_slide_1.jpg',
    mime: 'image/jpeg'
  },
  {
    url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-27.png',
    localName: 'hero_slide_2.png',
    r2Key: 'images/hero_slide_2.png',
    mime: 'image/png'
  },
  {
    url: 'https://www.sf.org.pk/wp-content/uploads/2024/09/Shakarganj-Foundation-Adds-Gynaecologist-to-Healthcare-Team-1150-x-600-px.png',
    localName: 'hero_slide_3.png',
    r2Key: 'images/hero_slide_3.png',
    mime: 'image/png'
  }
];

async function run() {
  console.log('🚀 Starting Shakarganj Foundation Asset Ingestion...');
  const publicImages = path.resolve('public/images');
  if (!fs.existsSync(publicImages)) fs.mkdirSync(publicImages, { recursive: true });

  for (const item of items) {
    const localPath = path.join(publicImages, item.localName);
    try {
      console.log(`📥 Downloading ${item.url} -> ${item.localName}...`);
      execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${item.url}" -o "${localPath}"`);
      
      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
        console.log(`  ✓ Local asset saved: public/images/${item.localName}`);
        
        if (r2) {
          const buffer = fs.readFileSync(localPath);
          await r2.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: item.r2Key,
            Body: buffer,
            ContentType: item.mime
          }));
          console.log(`  ✓ R2 Uploaded: ${PUBLIC_DOMAIN}/${item.r2Key}`);
        }
      } else {
        console.warn(`  ⚠️ Failed to download: ${item.url}`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${item.localName}:`, err.message);
    }
  }
  console.log('✨ Asset Ingestion completed.');
}

run();
