import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
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
