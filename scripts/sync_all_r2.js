import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function run() {
  console.log('Starting full Cloudflare R2 sync for public assets...');
  const publicFiles = getAllFiles('public');
  let count = 0;

  for (const filePath of publicFiles) {
    const relativePath = path.relative('public', filePath).replace(/\\/g, '/');
    const r2Key = relativePath;
    const contentType = getContentType(filePath);
    const body = fs.readFileSync(filePath);

    try {
      await s3.send(new PutObjectCommand({
        Bucket: 'sf-uploads',
        Key: r2Key,
        Body: body,
        ContentType: contentType
      }));
      count++;
      console.log(`[${count}/${publicFiles.length}] Synced to R2: https://docs.sf.org.pk/${r2Key}`);
    } catch (e) {
      console.error(`Error uploading ${r2Key}:`, e.message);
    }
  }

  console.log(`✓ Cloudflare R2 sync complete! Total assets synced: ${count}`);
}

run();
