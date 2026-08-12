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

const filesToUpload = [
  {
    localPath: 'public/images/newsletters/sf_newsletter_2025_26.jpg',
    key: 'images/newsletters/sf_newsletter_2025_26.jpg',
    mime: 'image/jpeg'
  },
  {
    localPath: 'public/documents/SF_Newsletter_2025_26.pdf',
    key: 'documents/SF_Newsletter_2025_26.pdf',
    mime: 'application/pdf'
  },
  {
    localPath: 'public/images/newsletters/sf_newsletter_2024_25.jpg',
    key: 'images/newsletters/sf_newsletter_2024_25.jpg',
    mime: 'image/jpeg'
  },
  {
    localPath: 'public/documents/SF_Newsletter_2024_25.pdf',
    key: 'documents/SF_Newsletter_2024_25.pdf',
    mime: 'application/pdf'
  },
  {
    localPath: 'public/images/newsletters/sf_newsletter_2023_24.jpg',
    key: 'images/newsletters/sf_newsletter_2023_24.jpg',
    mime: 'image/jpeg'
  },
  {
    localPath: 'public/documents/SF_Newsletter_2023_24.pdf',
    key: 'documents/SF_Newsletter_2023_24.pdf',
    mime: 'application/pdf'
  }
];

async function run() {
  for (const file of filesToUpload) {
    const filePath = path.resolve(file.localPath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Uploading ${file.key} (${fileBuffer.length} bytes) to Cloudflare R2 bucket "${bucketName}"...`);

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: file.key,
      Body: fileBuffer,
      ContentType: file.mime,
    }));

    console.log(`✓ Uploaded successfully! Public URL: https://docs.sf.org.pk/${file.key}`);
  }
}

run().catch((err) => {
  console.error("Upload error:", err);
});
