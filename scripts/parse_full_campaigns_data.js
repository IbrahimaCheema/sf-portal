import fs from 'fs';

const content = fs.readFileSync('C:\\Users\\ibrah\\.gemini\\antigravity-ide\\brain\\d237c43b-0cc7-4528-8e1e-ce58247e42a9\\.system_generated\\steps\\773\\content.md', 'utf-8');

const blocks = content.split(/<h3 id="gototop"[^>]*>/i);

const campaignsMap = new Map();

blocks.forEach((block, idx) => {
  if (idx === 0) return;

  const titleMatch = block.match(/<span[^>]*>(.*?)<\/span>/s);
  let rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  rawTitle = rawTitle.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").replace(/&amp;/g, '&');
  
  if (!rawTitle || rawTitle.length < 3) return;

  const pMatches = block.match(/<p[^>]*>(.*?)<\/p>/gs);
  let desc = '';
  if (pMatches) {
    desc = pMatches.map(p => p.replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").replace(/&amp;/g, '&').trim()).filter(t => t.length > 10).join(' ');
  }

  if (!desc || desc.length < 15) {
    const textMatch = block.match(/<div[^>]*dir="auto"[^>]*>(.*?)<\/div>/s);
    if (textMatch) {
      desc = textMatch[1].replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").replace(/&amp;/g, '&').trim();
    }
  }

  const mainImgMatch = block.match(/<img[^>]+src="(https:\/\/www\.sf\.org\.pk\/wp-content\/uploads\/[^"]+)"/i);
  let mainImg = mainImgMatch ? mainImgMatch[1] : '';

  const galleryMatches = [...block.matchAll(/<a class="prettyphoto" href="(https:\/\/www\.sf\.org\.pk\/wp-content\/uploads\/[^"]+)"/gi)];
  const gallery = galleryMatches.map(m => m[1]);

  let category = 'Community Welfare';
  const lowerTitle = rawTitle.toLowerCase();

  if (lowerTitle.includes('fruit') || lowerTitle.includes('food') || lowerTitle.includes('nutrition') || lowerTitle.includes('rice') || lowerTitle.includes('sugar') || lowerTitle.includes('ramzan')) {
    category = 'Nutrition & Food';
  } else if (lowerTitle.includes('medical') || lowerTitle.includes('camp') || lowerTitle.includes('gynae') || lowerTitle.includes('eye') || lowerTitle.includes('hepatitis') || lowerTitle.includes('dermatology') || lowerTitle.includes('diabetes')) {
    category = 'Healthcare Camps';
  } else if (lowerTitle.includes('literacy') || lowerTitle.includes('watches') || lowerTitle.includes('vocational') || lowerTitle.includes('school')) {
    category = 'Education & Literacy';
  } else if (lowerTitle.includes('sports') || lowerTitle.includes('painting') || lowerTitle.includes('shoes')) {
    category = 'Sports & Youth';
  }

  const dateMatch = desc.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+|-?\s*)\d{4}/i);
  const dateStr = dateMatch ? dateMatch[0] : '';

  const key = rawTitle.toLowerCase();

  if (!campaignsMap.has(key)) {
    campaignsMap.set(key, {
      id: `campaign-${campaignsMap.size + 1}`,
      title: rawTitle,
      category,
      date: dateStr,
      desc: desc.substring(0, 320) + (desc.length > 320 ? '...' : ''),
      fullDesc: desc,
      mainImg: mainImg,
      gallery: gallery
    });
  } else {
    // Merge missing data
    const existing = campaignsMap.get(key);
    if (!existing.mainImg && mainImg) existing.mainImg = mainImg;
    if (gallery.length > 0 && existing.gallery.length === 0) existing.gallery = gallery;
    if (!existing.date && dateStr) existing.date = dateStr;
    if (desc.length > existing.fullDesc.length) {
      existing.fullDesc = desc;
      existing.desc = desc.substring(0, 320) + (desc.length > 320 ? '...' : '');
    }
  }
});

const campaigns = Array.from(campaignsMap.values());

console.log(`Deduplicated to ${campaigns.length} unique master campaigns.`);
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/campaigns.json', JSON.stringify(campaigns, null, 2));
console.log('Saved clean deduplicated dataset to src/data/campaigns.json');
