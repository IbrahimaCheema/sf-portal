import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/education-1-200x200.png', local: 'public/images/edu_adopted_schools.png', key: 'images/edu_adopted_schools.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/nutrition-200x200.png', local: 'public/images/edu_nutrition.png', key: 'images/edu_nutrition.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/adult-literacy-200x200.png', local: 'public/images/edu_adult_literacy.png', key: 'images/edu_adult_literacy.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/graph-1.png', local: 'public/images/edu_literacy_graph.png', key: 'images/edu_literacy_graph.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/jugnu-sabaq-1-e1694416788492.jpg', local: 'public/images/edu_jugnu_sabaq.jpg', key: 'images/edu_jugnu_sabaq.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/training-1-1-e1694416919942.jpeg', local: 'public/images/edu_training_1.jpg', key: 'images/edu_training_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/training-2-1-e1694416871187.jpeg', local: 'public/images/edu_training_2.jpg', key: 'images/edu_training_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/opening-cermony-1-e1694416955512.jpg', local: 'public/images/edu_opening_ceremony.jpg', key: 'images/edu_opening_ceremony.jpg', mime: 'image/jpeg' }
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
