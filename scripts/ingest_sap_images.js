import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const images = [
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/Muhammad-Saifullah.jpg', local: 'public/images/sap_muhammad_saifullah.jpg', key: 'images/sap_muhammad_saifullah.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-06-at-9.44.26-AM-240x320.jpeg', local: 'public/images/sap_dr_shahid.jpg', key: 'images/sap_dr_shahid.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/samra.jpg', local: 'public/images/sap_samra_ashraf.jpg', key: 'images/sap_samra_ashraf.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/amir-240X320.png', local: 'public/images/sap_dr_aamir.png', key: 'images/sap_dr_aamir.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2024/02/Untitled-design-3-240x320.png', local: 'public/images/sap_mustapha_altaf.png', key: 'images/sap_mustapha_altaf.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/pervez-240x320-1.png', local: 'public/images/sap_pervez_akhtar.png', key: 'images/sap_pervez_akhtar.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/manzoor-240x320-1.png', local: 'public/images/sap_manzoor_malik.png', key: 'images/sap_manzoor_malik.png', mime: 'image/png' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-06-at-10.33.59-AM-240x320.jpeg', local: 'public/images/sap_hussain_malik.jpg', key: 'images/sap_hussain_malik.jpg', mime: 'image/jpeg' }
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
