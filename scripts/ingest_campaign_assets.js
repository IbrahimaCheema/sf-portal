import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const campaignsData = JSON.parse(fs.readFileSync('src/data/campaigns.json', 'utf-8'));

fs.mkdirSync('public/images/campaigns', { recursive: true });

async function run() {
  console.log(`Starting ingestion of main images for ${campaignsData.length} campaigns...`);
  
  for (let i = 0; i < campaignsData.length; i++) {
    const c = campaignsData[i];
    if (c.mainImg) {
      const ext = c.mainImg.endsWith('.png') ? 'png' : 'jpg';
      const filename = `c_${c.id}.${ext}`;
      const localPath = `public/images/campaigns/${filename}`;
      const r2Key = `images/campaigns/${filename}`;
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      if (!fs.existsSync(localPath)) {
        try {
          execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${c.mainImg}" -o "${localPath}"`);
          if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
            const body = fs.readFileSync(localPath);
            await s3.send(new PutObjectCommand({ Bucket: 'sf-uploads', Key: r2Key, Body: body, ContentType: mime }));
            console.log(`✓ [${i+1}/${campaignsData.length}] Uploaded: https://docs.sf.org.pk/${r2Key}`);
          }
        } catch (e) {
          console.error(`Failed to ingest ${c.mainImg}:`, e.message);
        }
      }
      // Attach r2 and local urls
      c.r2MainImg = `https://docs.sf.org.pk/${r2Key}`;
      c.localMainImg = `/images/campaigns/${filename}`;
    } else {
      c.r2MainImg = '';
      c.localMainImg = '';
    }
  }

  fs.writeFileSync('src/data/campaigns.json', JSON.stringify(campaignsData, null, 2));
  console.log('Updated src/data/campaigns.json with R2 & Local Image URLs!');
}

run();
