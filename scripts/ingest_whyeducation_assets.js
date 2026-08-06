import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/Private-and-2.png', key: 'whyedu_infographic_1.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/Private-and-3.png', key: 'whyedu_infographic_2.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/school-4-800-600.png', key: 'whyedu_school_1.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/school-3-600-800.png', key: 'whyedu_school_2.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/school-2-600-800.png', key: 'whyedu_school_3.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/stair-1-600-800-1.png', key: 'whyedu_school_4.png' }
];

fs.mkdirSync('public/images/whyedu', { recursive: true });

async function run() {
  console.log('Ingesting Why Education assets...');
  for (const a of assets) {
    const localPath = `public/images/whyedu/${a.key}`;
    const r2Key = `images/whyedu/${a.key}`;
    const mime = a.key.endsWith('.png') ? 'image/png' : 'image/jpeg';

    if (!fs.existsSync(localPath)) {
      try {
        execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${a.url}" -o "${localPath}"`);
      } catch (e) {
        console.error(`Error downloading ${a.url}:`, e.message);
      }
    }

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
      const body = fs.readFileSync(localPath);
      await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: r2Key, Body: body, ContentType: mime }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${r2Key}`);
    }
  }
}

run();
