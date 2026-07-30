import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/Blue-Work-From-Home-Instagram-Post-1.png', local: 'public/images/talib_hussain_scholarship.png', key: 'images/talib_hussain_scholarship.png', mime: 'image/png' }
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
