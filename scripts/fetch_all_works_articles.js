import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const accountId = '9594508e0e41ab8192d129114cd8a539';
const accessKeyId = '88259ed0fa78e8cc0f96164e482305b9';
const secretAccessKey = '56867590a76e8b4721b231674aaf460aabb62bef32f78bb38bc532114efa97ab';
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

const articles = [
  { slug: 'service-above-self', url: 'https://www.sf.org.pk/works/service-above-self/' },
  { slug: 'drug-addiction-among-youth-a-growing-challenge-in-our-community', url: 'https://www.sf.org.pk/works/drug-addiction-among-youth-a-growing-challenge-in-our-community/' },
  { slug: 'building-hope-enriching-lives', url: 'https://www.sf.org.pk/works/building-hope-enriching-lives/' },
  { slug: 'diabetes-its-impact-on-our-life-and-its-management', url: 'https://www.sf.org.pk/works/diabetes-its-impact-on-our-life-and-its-management/' },
  { slug: 'the-most-powerful-weapon-to-change-the-world', url: 'https://www.sf.org.pk/works/education-the-most-powerful-weapon-to-change-the-world/' },
  { slug: 'from-learning-to-livelihood-how-skills-transform-communities', url: 'https://www.sf.org.pk/works/from-learning-to-livelihood-how-skills-transform-communities/' },
  { slug: 'a-long-road-ahead-the-struggle-for-gender-equality', url: 'https://www.sf.org.pk/works/a-long-road-ahead-the-struggle-for-gender-equality/' },
  { slug: 'importance-of-cultural-competence-in-social-work', url: 'https://www.sf.org.pk/works/importance-of-cultural-competence-in-social-work/' },
  { slug: 'article-8', url: 'https://www.sf.org.pk/works/article-8/' },
  { slug: 'article-7', url: 'https://www.sf.org.pk/works/article-7/' },
  { slug: 'article-6', url: 'https://www.sf.org.pk/works/article-6/' },
  { slug: 'article-5', url: 'https://www.sf.org.pk/works/article-5/' },
  { slug: 'providing-education-and-healthcare-to-underprivileged-children-a-national-duty', url: 'https://www.sf.org.pk/works/providing-education-and-healthcare-to-underprivileged-children-a-national-duty/' },
  { slug: 'assessment-of-drinking-water-quality-in-jhang', url: 'https://www.sf.org.pk/works/assessment-of-drinking-water-quality-in-jhang/' },
  { slug: 'impact-of-healthcare-program-on-rural-areas', url: 'https://www.sf.org.pk/works/impact-of-healthcare-program-on-rural-areas/' },
  { slug: 'impact-of-nutritional-programs', url: 'https://www.sf.org.pk/works/impact-of-nutritional-programs/' }
];

fs.mkdirSync('public/images/works', { recursive: true });
fs.mkdirSync('src/data', { recursive: true });

async function run() {
  console.log('Fetching 16 full publication articles...');
  const results = [];

  for (const item of articles) {
    console.log(`Processing: ${item.slug} (${item.url})`);
    const tempHtmlFile = `scratch_${item.slug}.html`;
    try {
      execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${item.url}" -o "${tempHtmlFile}"`);
    } catch (e) {
      console.error(`Error downloading ${item.url}:`, e.message);
    }

    if (fs.existsSync(tempHtmlFile)) {
      const html = fs.readFileSync(tempHtmlFile, 'utf-8');
      fs.unlinkSync(tempHtmlFile);

      // Extract Title
      const titleMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<title>([\s\S]*?)<\/title>/i);
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&#038;/g, '&').trim() : item.slug;
      title = title.replace(/– Shakarganj Foundation/g, '').trim();

      // Extract Main Content Body
      let bodyHtml = '';
      const contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/article>/i) ||
                           html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/main>/i) ||
                           html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

      if (contentMatch) {
        bodyHtml = contentMatch[1];
      } else {
        bodyHtml = '<p>Detailed article content available directly from Shakarganj Foundation field research archives.</p>';
      }

      // Extract all images inside body
      const imgRegex = /<img[^>]+src="([^">]+)"/gi;
      let imgMatch;
      const imageUrls = [];
      while ((imgMatch = imgRegex.exec(bodyHtml)) !== null) {
        if (imgMatch[1] && !imgMatch[1].includes('sf_logo') && !imgMatch[1].includes('avatar') && !imgMatch[1].includes('mcb')) {
          imageUrls.push(imgMatch[1]);
        }
      }

      // Download and upload images to R2
      const processedImages = [];
      let imgIdx = 1;
      for (const imgUrl of imageUrls) {
        const ext = imgUrl.endsWith('.png') ? 'png' : 'jpg';
        const imgName = `${item.slug}_img_${imgIdx}.${ext}`;
        const localImgPath = `public/images/works/${imgName}`;
        const r2Key = `images/works/${imgName}`;

        if (!fs.existsSync(localImgPath)) {
          try {
            execSync(`curl.exe -k -s -L -A "Mozilla/5.0" "${imgUrl}" -o "${localImgPath}"`);
          } catch (e) {
            console.error(`Error downloading image ${imgUrl}:`, e.message);
          }
        }

        if (fs.existsSync(localImgPath) && fs.statSync(localImgPath).size > 100) {
          const body = fs.readFileSync(localImgPath);
          await s3.send(new PutObjectCommand({ 
            Bucket: 'sf-uploads', 
            Key: r2Key, 
            Body: body, 
            ContentType: ext === 'png' ? 'image/png' : 'image/jpeg' 
          }));
          processedImages.push(`https://docs.sf.org.pk/${r2Key}`);
        }
        imgIdx++;
      }

      results.push({
        slug: item.slug,
        url: item.url,
        title,
        bodyHtml,
        images: processedImages
      });
    }
  }

  fs.writeFileSync('src/data/worksArticles.json', JSON.stringify(results, null, 2));
  console.log(`✓ Successfully saved ${results.length} articles to src/data/worksArticles.json`);
}

run();
