import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/Untitled-350x195-1-200x196.jpg', local: 'public/images/tmsg_main_header.jpg', key: 'images/tmsg_main_header.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg10.png', local: 'public/images/tmsg_photo_1.png', key: 'images/tmsg_photo_1.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg6.png', local: 'public/images/tmsg_photo_2.png', key: 'images/tmsg_photo_2.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg8.png', local: 'public/images/tmsg_photo_3.png', key: 'images/tmsg_photo_3.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg9.png', local: 'public/images/tmsg_photo_4.png', key: 'images/tmsg_photo_4.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg5.png', local: 'public/images/tmsg_photo_5.png', key: 'images/tmsg_photo_5.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg2.png', local: 'public/images/tmsg_photo_6.png', key: 'images/tmsg_photo_6.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg3.png', local: 'public/images/tmsg_photo_7.png', key: 'images/tmsg_photo_7.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/12/tmsg1.png', local: 'public/images/tmsg_photo_8.png', key: 'images/tmsg_photo_8.png', mime: 'image/png' }
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
