import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const images = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/us-aid-1-e1690628900866.png', local: 'public/images/story_usaid.png', key: 'images/story_usaid.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/award-1-2-e1691476660126-200x200.jpg', local: 'public/images/story_csr_award.jpg', key: 'images/story_csr_award.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/asian-csr-200x200.png', local: 'public/images/story_intel_aim.png', key: 'images/story_intel_aim.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/5-Muhammad-Ali-2-200x200.jpg', local: 'public/images/story_artificial_limbs.jpg', key: 'images/story_artificial_limbs.jpg', mime: 'image/jpeg' }
];

async function run() {
  for (const img of images) {
    console.log(`Downloading ${img.url}...`);
    execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${img.url}" -o "${img.local}"`);
    if (fs.existsSync(img.local)) {
      const body = fs.readFileSync(img.local);
      await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: img.key, Body: body, ContentType: img.mime }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${img.key}`);
    }
  }
}
run();
