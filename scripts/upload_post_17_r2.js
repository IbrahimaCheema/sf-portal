import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
);

const accountId = envVars.CLOUDFLARE_ACCOUNT_ID || envVars.R2_ACCOUNT_ID;
const accessKeyId = envVars.R2_ACCESS_KEY_ID;
const secretAccessKey = envVars.R2_SECRET_ACCESS_KEY;
const bucketName = envVars.R2_BUCKET_NAME || 'sf-uploads';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function run() {
  const filePath = path.resolve('public/images/hd_ig_post_17.jpg');
  const key = 'images/hd_ig_post_17.jpg';
  
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);
  console.log(`Uploading ${key} (${fileBuffer.length} bytes) to Cloudflare R2 bucket "${bucketName}"...`);

  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/jpeg',
  }));

  console.log(`✓ Uploaded successfully! Public URL: https://docs.sf.org.pk/${key}`);
}

run().catch((err) => {
  console.error("Upload error:", err);
});
