import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const images = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/ams-2-1-2.png', local: 'public/images/board_altaf_saleem.png', key: 'images/board_altaf_saleem.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/rashid-ahmad.jpg', local: 'public/images/board_rashid_ahmad.jpg', key: 'images/board_rashid_ahmad.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/anjum-saleem-240x320.png', local: 'public/images/board_anjum_saleem.png', key: 'images/board_anjum_saleem.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/ahsan-m-saleem.jpg', local: 'public/images/board_ahsan_saleem.jpg', key: 'images/board_ahsan_saleem.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/Ali-Altaf-Saleem.jpg', local: 'public/images/board_ali_altaf.jpg', key: 'images/board_ali_altaf.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/awais-qureshi.jpg', local: 'public/images/board_awais_qureshi.jpg', key: 'images/board_awais_qureshi.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/pervez-240x320-1.png', local: 'public/images/board_pervez_akhtar.png', key: 'images/board_pervez_akhtar.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/sarfraz-1.jpg', local: 'public/images/board_sarfraz_mahmood.jpg', key: 'images/board_sarfraz_mahmood.jpg', mime: 'image/jpeg' }
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
