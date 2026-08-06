import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const assets = [
  // Header icons
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/arts-crafts-1-200x200.jpg', local: 'public/images/art_finearts_icon.jpg', key: 'images/art_finearts_icon.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/07/357457661_245649295018521_928963223196610932_n-e1690719253523-200x200.jpg', local: 'public/images/art_fashion_icon.jpg', key: 'images/art_fashion_icon.jpg', mime: 'image/jpeg' },

  // Fine Arts Gallery (8)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374171414_268090629441054_6933325203581684673_n.jpg', local: 'public/images/art_fa_1.jpg', key: 'images/art_fa_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/375167264_269188695997914_8149472001990527231_n.jpg', local: 'public/images/art_fa_2.jpg', key: 'images/art_fa_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/375836385_272017115715072_7370425606434462065_n.jpg', local: 'public/images/art_fa_3.jpg', key: 'images/art_fa_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376055991_273164188933698_4388450391399738094_n-1.jpg', local: 'public/images/art_fa_4.jpg', key: 'images/art_fa_4.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/377447736_272017192381731_6485281913852752735_n.jpg', local: 'public/images/art_fa_5.jpg', key: 'images/art_fa_5.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/379639419_276151055301678_4776472954592214019_n.jpg', local: 'public/images/art_fa_6.jpg', key: 'images/art_fa_6.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/379692703_276150938635023_6089792647281281785_n.jpg', local: 'public/images/art_fa_7.jpg', key: 'images/art_fa_7.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/379688864_276151251968325_8375702948034077331_n.jpg', local: 'public/images/art_fa_8.jpg', key: 'images/art_fa_8.jpg', mime: 'image/jpeg' },

  // Fashion Designing Gallery (8)
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/374528192_276753205241463_3605130557698101789_n.jpg', local: 'public/images/art_fd_1.jpg', key: 'images/art_fd_1.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/375984076_269774629272654_8409761875834791406_n-1.jpg', local: 'public/images/art_fd_2.jpg', key: 'images/art_fd_2.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376711188_273720168878100_7051049089215456531_n-1.jpg', local: 'public/images/art_fd_3.jpg', key: 'images/art_fd_3.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376729937_272589655657818_9090810656422947568_n.jpg', local: 'public/images/art_fd_4.jpg', key: 'images/art_fd_4.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376792401_276752971908153_8279209862951928234_n-1.jpg', local: 'public/images/art_fd_5.jpg', key: 'images/art_fd_5.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376800243_276753098574807_7532678388757613195_n.jpg', local: 'public/images/art_fd_6.jpg', key: 'images/art_fd_6.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376877568_276753785241405_3338712239258000470_n.jpg', local: 'public/images/art_fd_7.jpg', key: 'images/art_fd_7.jpg', mime: 'image/jpeg' },
  { url: 'https://www.sf.org.pk/wp-content/uploads/2023/09/376885671_272589722324478_813275154970761636_n.jpg', local: 'public/images/art_fd_8.jpg', key: 'images/art_fd_8.jpg', mime: 'image/jpeg' }
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
