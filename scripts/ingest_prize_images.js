import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/prize-distribution-9-200x200.jpg', local: 'public/images/prize_main_header.jpg', key: 'images/prize_main_header.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-1.jpg', local: 'public/images/prize_ceremony_1.jpg', key: 'images/prize_ceremony_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-2.jpg', local: 'public/images/prize_ceremony_2.jpg', key: 'images/prize_ceremony_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-3.jpg', local: 'public/images/prize_ceremony_3.jpg', key: 'images/prize_ceremony_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-4.jpg', local: 'public/images/prize_ceremony_4.jpg', key: 'images/prize_ceremony_4.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-5.jpg', local: 'public/images/prize_ceremony_5.jpg', key: 'images/prize_ceremony_5.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-6.jpg', local: 'public/images/prize_ceremony_6.jpg', key: 'images/prize_ceremony_6.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-7.jpg', local: 'public/images/prize_ceremony_7.jpg', key: 'images/prize_ceremony_7.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/prize-distribution-8.jpg', local: 'public/images/prize_ceremony_8.jpg', key: 'images/prize_ceremony_8.jpg', mime: 'image/jpeg' }
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
