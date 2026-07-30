import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const publications = [
  { id: 'pub-1', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/Shakarganj_Foundation_350x236_under350KB.jpg' },
  { id: 'pub-2', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/shahid_350_236.jpeg' },
  { id: 'pub-3', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/heading_350.jpg' },
  { id: 'pub-4', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/healthcare_350_236.jpeg' },
  { id: 'pub-5', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/education_350_236-1.jpeg' },
  { id: 'pub-6', url: 'https://www.sf.org.pk/wp-content/uploads/2026/07/article_11_350_236.png' },
  { id: 'pub-7', url: 'https://www.sf.org.pk/wp-content/uploads/2025/08/cover-1.png' },
  { id: 'pub-8', url: 'https://www.sf.org.pk/wp-content/uploads/2025/02/Screenshot-2025-02-08-115412-1.png' },
  { id: 'pub-9', url: 'https://www.sf.org.pk/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-28-at-12.47.09-PM-1.jpeg' },
  { id: 'pub-10', url: 'https://www.sf.org.pk/wp-content/uploads/2024/12/468645271_546627051587409_8823134883580686184_n-1.jpg' },
  { id: 'pub-11', url: 'https://www.sf.org.pk/wp-content/uploads/2024/12/428635556_363783509871765_1458291000395903297_n-1.png' },
  { id: 'pub-12', url: 'https://www.sf.org.pk/wp-content/uploads/2024/11/slider-552.png' },
  { id: 'pub-13', url: 'https://www.sf.org.pk/wp-content/uploads/2023/10/slider-1-1-1-350x236-1.jpg' },
  { id: 'pub-14', url: 'https://www.sf.org.pk/wp-content/uploads/2023/10/Picture22-350x236-2.jpg' },
  { id: 'pub-15', url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/slider-healthcare-350x236-1.jpg' },
  { id: 'pub-16', url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/article-education-350x236-1.jpg' }
];

fs.mkdirSync('public/images/publications', { recursive: true });

async function run() {
  console.log('Ingesting Publications cover assets...');
  for (const p of publications) {
    const ext = p.url.endsWith('.png') ? 'png' : 'jpg';
    const localPath = `public/images/publications/${p.id}.${ext}`;
    const r2Key = `images/publications/${p.id}.${ext}`;

    if (!fs.existsSync(localPath)) {
      try {
        execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${p.url}" -o "${localPath}"`);
      } catch (e) {
        console.error(`Error downloading ${p.url}:`, e.message);
      }
    }

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
      const body = fs.readFileSync(localPath);
      await s3.send(new PutObjectCommand({ 
        Bucket: 'sf-uploads', 
        Key: r2Key, 
        Body: body, 
        ContentType: ext === 'png' ? 'image/png' : 'image/jpeg' 
      }));
      console.log(`✓ Uploaded: https://docs.sf.org.pk/${r2Key}`);
    }
  }
}

run();
