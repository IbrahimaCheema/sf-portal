import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

async function run() {
  const body = fs.readFileSync('public/images/publications/pub-12.jpg');
  await s3.send(new PutObjectCommand({
    Bucket: 'sf-uploads',
    Key: 'images/publications/pub-12.jpg',
    Body: body,
    ContentType: 'image/jpeg'
  }));
  console.log('✓ Successfully uploaded https://docs.sf.org.pk/images/publications/pub-12.jpg to R2!');
}

run();
