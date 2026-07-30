import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/mcb-bank-logo-34F6A134AD-seeklogo.com_.png', key: 'mcb_logo.png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/sf_logo_bg_hd.png', key: 'sf_logo_hd.png' }
];

fs.mkdirSync('public/images', { recursive: true });

async function run() {
  console.log('Ingesting Donate Now assets...');
  for (const a of assets) {
    const localPath = `public/images/${a.key}`;
    const r2Key = `images/${a.key}`;

    if (!fs.existsSync(localPath)) {
      try {
        execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${a.url}" -o "${localPath}"`);
      } catch (e) {
        console.error(`Error downloading ${a.url}:`, e.message);
      }
    }

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
      const body = fs.readFileSync(localPath);
      await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: r2Key, Body: body, ContentType: 'image/png' }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${r2Key}`);
    }
  }
}

run();
