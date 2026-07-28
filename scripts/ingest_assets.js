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
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/sf_logo_bg.png', localName: 'sf_logo_bg.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-15-at-11.44.49-AM.jpeg', localName: 'slider_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-27.png', localName: 'slider_2.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/09/Shakarganj-Foundation-Adds-Gynaecologist-to-Healthcare-Team-1150-x-600-px.png', localName: 'slider_3.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-29.png', localName: 'slider_4.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px-1.png', localName: 'slider_5.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/SF-Website-Slider-Pic-1200-x-600-px-3.png', localName: 'slider_6.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/RUFT-Design-3.png', localName: 'slider_7.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px.png', localName: 'slider_8.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/Copy-of-SF-Website-Slider-Pic-1200-x-600-px-2.png', localName: 'slider_9.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px-2.png', localName: 'slider_10.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Untitled-design.png', localName: 'slider_11.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/02/479389759_599852552931525_3865703827591218268_n.jpg', localName: 'slider_12.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/slider-20240228.png', localName: 'slider_13.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-28-at-3.15.30-PM.jpeg', localName: 'slider_14.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/slider-2.png', localName: 'slider_15.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-26-at-5.27.32-PM.jpeg', localName: 'slider_16.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/01/food-drive-slider1.png', localName: 'slider_17.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/slider-1.png', localName: 'slider_18.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/01/fashion-slider-1.jpg', localName: 'slider_19.jpg', mime: 'image/jpeg' }
];

async function run() {
  console.log(`🚀 Starting Ingestion of ${items.length} Shakarganj Foundation Assets...`);
  const publicImages = path.resolve('public/images');
  if (!fs.existsSync(publicImages)) fs.mkdirSync(publicImages, { recursive: true });

  for (const item of items) {
    const localPath = path.join(publicImages, item.localName);
    try {
      console.log(`📥 Downloading ${item.localName}...`);
      execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${item.url}" -o "${localPath}"`);
      
      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
        console.log(`  ✓ Saved: public/images/${item.localName}`);
        
        if (r2) {
          const buffer = fs.readFileSync(localPath);
          await r2.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `images/${item.localName}`,
            Body: buffer,
            ContentType: item.mime
          }));
          console.log(`  ✓ R2 Uploaded: ${PUBLIC_DOMAIN}/images/${item.localName}`);
        }
      } else {
        console.warn(`  ⚠️ Failed: ${item.url}`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${item.localName}:`, err.message);
    }
  }
  console.log('✨ Ingestion of all 19 slider assets completed!');
}

run();
