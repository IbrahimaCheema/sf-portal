import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/WhatsApp-Image-2023-12-06-at-5.10.35-PM-150x200.jpeg', local: 'public/images/hero_dr_aamir.jpg', key: 'images/hero_dr_aamir.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/dr-ejaz-sultan-1-150x200.jpeg', local: 'public/images/hero_dr_ejaz.jpg', key: 'images/hero_dr_ejaz.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/dr-sabika-zia1-150x200.png', local: 'public/images/hero_dr_sabika.png', key: 'images/hero_dr_sabika.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/dr-talal-mazhar2-150x200.png', local: 'public/images/hero_dr_talal.png', key: 'images/hero_dr_talal.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/dr-luqman-150x200.png', local: 'public/images/hero_dr_luqman.png', key: 'images/hero_dr_luqman.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/dr-javed-150x200.png', local: 'public/images/hero_dr_javed.png', key: 'images/hero_dr_javed.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/01/Screenshot-2024-01-20-100505-150x200.png', local: 'public/images/hero_dr_danyal.png', key: 'images/hero_dr_danyal.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-14-at-10.20.10-AM-150x200.jpeg', local: 'public/images/hero_dr_asim.jpg', key: 'images/hero_dr_asim.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-11-at-2.43.39-PM-150x200.jpeg', local: 'public/images/hero_dr_shahid.jpg', key: 'images/hero_dr_shahid.jpg', mime: 'image/jpeg' }
];

async function run() {
  for (const asset of assets) {
    console.log(`Downloading ${asset.url}...`);
    execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${asset.url}" -o "${asset.local}"`);
    if (fs.existsSync(asset.local)) {
      const body = fs.readFileSync(asset.local);
      await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: asset.key, Body: body, ContentType: asset.mime }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${asset.key}`);
    }
  }
}
run();
