import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const images = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/reg-1.png', local: 'public/images/reg_societies_act.png', key: 'images/reg_societies_act.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/Charity_Certificate-1_001-2-1.png', local: 'public/images/reg_punjab_charities.png', key: 'images/reg_punjab_charities.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/fbr-1-769x1024.jpeg', local: 'public/images/reg_fbr.jpg', key: 'images/reg_fbr.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/usaid.jpeg', local: 'public/images/reg_usaid.jpg', key: 'images/reg_usaid.jpg', mime: 'image/jpeg' }
];

async function run() {
  for (const img of images) {
    console.log(`Downloading ${img.url}...`);
    execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${img.url}" -o "${img.local}"`);
    if (fs.existsSync(img.local)) {
      const body = fs.readFileSync(img.local);
      await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: img.key, Body: body, ContentType: img.mime }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${img.key}`);
    }
  }
}
run();
