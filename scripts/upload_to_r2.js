import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import https from 'https';
import fs from 'fs';
import path from 'path';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'sf-uploads';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const assets = [
  // Hero Sliders (19)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-15-at-11.44.49-AM.jpeg', key: 'images/slider_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-27.png', key: 'images/slider_2.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/09/Shakarganj-Foundation-Adds-Gynaecologist-to-Healthcare-Team-1150-x-600-px.png', key: 'images/slider_3.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-29.png', key: 'images/slider_4.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px-1.png', key: 'images/slider_5.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/SF-Website-Slider-Pic-1200-x-600-px-3.png', key: 'images/slider_6.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/RUFT-Design-3.png', key: 'images/slider_7.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px.png', key: 'images/slider_8.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/Copy-of-SF-Website-Slider-Pic-1200-x-600-px-2.png', key: 'images/slider_9.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Shakarganj-Vocational-Lab-Instagram-Post-45-1200-x-600-px-2.png', key: 'images/slider_10.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/12/Untitled-design.png', key: 'images/slider_11.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/02/479389759_599852552931525_3865703827591218268_n.jpg', key: 'images/slider_12.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/slider-20240228.png', key: 'images/slider_13.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-28-at-3.15.30-PM.jpeg', key: 'images/slider_14.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/slider-2.png', key: 'images/slider_15.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-26-at-5.27.32-PM.jpeg', key: 'images/slider_16.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/01/food-drive-slider1.png', key: 'images/slider_17.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/slider-1.png', key: 'images/slider_18.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/01/fashion-slider-1.jpg', key: 'images/slider_19.jpg', mime: 'image/jpeg' },

  // Program Cards & Logo
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/education-1-350x250.png', key: 'images/card_education.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/373330647_268655812717869_6430380279538548162_n-1-e1694156256909-350x250.jpg', key: 'images/card_healthcare.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/art-1-350x250.png', key: 'images/card_art.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/sf-logo-circle-1080-100x100.png', key: 'images/sf_logo_bg.png', mime: 'image/png' },

  // Collaboration Logos (25)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/sml-logo1.png', key: 'images/sml_logo.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/fatima-2.jpeg', key: 'images/fatima_group.jpeg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/lions-club.png', key: 'images/lions_club.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/dhq-3.png', key: 'images/dhq_hospital.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/indus-2.png', key: 'images/indus_hospital.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/shaigan-2.png', key: 'images/shaigan.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/searle-2.png', key: 'images/searle.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/asian-2.png', key: 'images/asian_food.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg-2.png', key: 'images/tmsg.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/iwh-2.png', key: 'images/iwh.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/getz-2.png', key: 'images/getz_pharma.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/atco-2.png', key: 'images/atco_lab.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/bmc-2.png', key: 'images/bmc.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/mc-2.png', key: 'images/mmc.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/psh11_180x180.png', key: 'images/sweet_home.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/genix-250x250-1.png', key: 'images/genix.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/Pharmevo-220x220-1.png', key: 'images/pharmevo.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/standpharm-200x200-1.png', key: 'images/standpharm.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/03/hirani.jpg', key: 'images/hirani.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/03/solace-pharma.png', key: 'images/solace.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-19-at-3.34.57-PM.jpg', key: 'images/saffron.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-19-at-3.34.49-PM-1.jpg', key: 'images/cell_lab.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-19-at-3.34.42-PM.jpg', key: 'images/hilton.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-19-at-3.34.43-PM.jpg', key: 'images/highnoon.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2025/08/tabrospharm200.png', key: 'images/tabros.png', mime: 'image/png' }
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  console.log(`🚀 Starting bulk upload of ${assets.length} assets to Cloudflare R2 bucket "${bucketName}"...`);
  
  let successCount = 0;
  for (const asset of assets) {
    try {
      console.log(`Downloading ${asset.key} from ${asset.url}...`);
      const buffer = await fetchBuffer(asset.url);
      
      console.log(`Uploading ${asset.key} (${buffer.length} bytes) to R2...`);
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: asset.key,
        Body: buffer,
        ContentType: asset.mime
      }));

      console.log(`✅ Uploaded ${asset.key} successfully!`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error uploading ${asset.key}:`, err.message);
    }
  }

  console.log(`\n🎉 Upload Complete! Successfully uploaded ${successCount}/${assets.length} assets to Cloudflare R2 bucket "${bucketName}".`);
}

run();
