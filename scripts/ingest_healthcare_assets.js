import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  // Icons / Main Headers
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/08/WhatsApp-Image-2023-08-03-at-4.09.54-PM-3-200x200.jpeg', local: 'public/images/hc_stationed_dispensary.jpg', key: 'images/hc_stationed_dispensary.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-27-at-2.55.40-PM-1-200x200.jpeg', local: 'public/images/hc_mobile_dispensary.jpg', key: 'images/hc_mobile_dispensary.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/artificial-1-200x200.png', local: 'public/images/hc_artificial_limbs.png', key: 'images/hc_artificial_limbs.png', mime: 'image/png' },

  // Stationed Dispensary Gallery (8)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374168887_272588272324623_8671420913053408463_n-1.jpg', local: 'public/images/hc_disp_1.jpg', key: 'images/hc_disp_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/379444618_276149511968499_816108690442032245_n.jpg', local: 'public/images/hc_disp_2.jpg', key: 'images/hc_disp_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/379980392_276149305301853_8358279037846084833_n-1.jpg', local: 'public/images/hc_disp_3.jpg', key: 'images/hc_disp_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/380363272_276149595301824_1522632096609292806_n.jpg', local: 'public/images/hc_disp_4.jpg', key: 'images/hc_disp_4.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374191831_273163322267118_699710322012427088_n.jpg', local: 'public/images/hc_disp_5.jpg', key: 'images/hc_disp_5.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374207712_273163358933781_2909907578529150620_n.jpg', local: 'public/images/hc_disp_6.jpg', key: 'images/hc_disp_6.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374516469_273163402267110_6753323523207121052_n.jpg', local: 'public/images/hc_disp_7.jpg', key: 'images/hc_disp_7.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/378374112_273163448933772_2454554023712425482_n.jpg', local: 'public/images/hc_disp_8.jpg', key: 'images/hc_disp_8.jpg', mime: 'image/jpeg' },

  // Mobile Dispensary Gallery (8)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374520815_273716562211794_904111373326459967_n-1.jpg', local: 'public/images/hc_mobile_1.jpg', key: 'images/hc_mobile_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376676168_273716782211772_7149101416842084721_n.jpg', local: 'public/images/hc_mobile_2.jpg', key: 'images/hc_mobile_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376814935_276754421908008_5062518081198481585_n.jpg', local: 'public/images/hc_mobile_3.jpg', key: 'images/hc_mobile_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376895390_276754455241338_9055229857220811695_n.jpg', local: 'public/images/hc_mobile_4.jpg', key: 'images/hc_mobile_4.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/375061482_269774339272683_219764574469566577_n.jpg', local: 'public/images/hc_mobile_5.jpg', key: 'images/hc_mobile_5.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376238164_269774155939368_6640916111893048342_n.jpg', local: 'public/images/hc_mobile_6.jpg', key: 'images/hc_mobile_6.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376915434_273716615545122_4200609026509568830_n.jpg', local: 'public/images/hc_mobile_7.jpg', key: 'images/hc_mobile_7.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376655474_273716665545117_97571016857055610_n.jpg', local: 'public/images/hc_mobile_8.jpg', key: 'images/hc_mobile_8.jpg', mime: 'image/jpeg' },

  // Artificial Limbs Gallery (4)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/limbs-11-1-e1694607475865.jpg', local: 'public/images/hc_limbs_1.jpg', key: 'images/hc_limbs_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/limbs-3-1-e1694607454693.jpg', local: 'public/images/hc_limbs_2.jpg', key: 'images/hc_limbs_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/limbs-5-1-e1694607433436.jpg', local: 'public/images/hc_limbs_3.jpg', key: 'images/hc_limbs_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/limbs-4-1-e1694607405158.jpg', local: 'public/images/hc_limbs_4.jpg', key: 'images/hc_limbs_4.jpg', mime: 'image/jpeg' }
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
