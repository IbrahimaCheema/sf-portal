import fs from 'fs';
import path from 'path';

const baseUrl = 'https://sf.org.pk';

const pages = [
  '/',
  '/about-us',
  '/activities-events',
  '/board-of-governors',
  '/campaigns',
  '/contact-us',
  '/donate-now',
  '/education',
  '/education-scholarship',
  '/financials',
  '/founder',
  '/healthcare',
  '/healthcare-heroes',
  '/jhang-art-gallery',
  '/mission-vision',
  '/prize-distribution-ceremonies',
  '/publications',
  '/registrations',
  '/sf-tmsg-fight-against-malnutrition',
  '/social-action-projects-committee',
  '/success-stories',
  '/whyeducation'
];

// Add works articles from worksArticles.json
try {
  const articlesRaw = fs.readFileSync('src/data/worksArticles.json', 'utf8');
  const articles = JSON.parse(articlesRaw);
  articles.forEach((a) => {
    if (a.slug) pages.push(`/works/${a.slug}`);
  });
} catch (e) {
  console.log('No worksArticles.json found, skipping dynamic routes');
}

const today = new Date().toISOString().split('T')[0];

const xmlUrls = pages.map((urlPath) => `
  <url>
    <loc>${baseUrl}${urlPath === '/' ? '' : urlPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${urlPath === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${urlPath === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync('public/sitemap.xml', sitemapXml.trim());
fs.writeFileSync('public/sitemap-index.xml', sitemapIndexXml.trim());

console.log(`✅ Generated sitemap.xml and sitemap-index.xml with ${pages.length} URLs!`);
