const postUrls = [
  'https://www.instagram.com/p/DbpPliJjMAW/embed/'
];

async function scrapePost(url) {
  try {
    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
    const res = await fetch(proxyUrl);
    const html = await res.text();
    
    // Regex matching property and content in any order
    const getMeta = (prop) => {
      const regex1 = new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i');
      const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${prop}["']`, 'i');
      const m1 = html.match(regex1);
      if (m1) return m1[1];
      const m2 = html.match(regex2);
      if (m2) return m2[1];
      return null;
    };

    console.log('HTML length:', html.length);
    const imgMatches = html.match(/src=["']([^"']+\.(?:jpg|png|jpeg|webp)[^"']*)["']/gi);
    console.log('Img matches:', imgMatches ? imgMatches.slice(0, 5) : 'None');
    const descMatches = html.match(/class="[^"]*Caption[^"]*"[^>]*>(.*?)<\/div>/gi) || html.match(/<img[^>]+alt=["']([^"']+)["']/i);
    console.log('Desc match:', descMatches ? descMatches[0] : 'None');
    
    let ogImg = getMeta('og:image');
    let ogDesc = getMeta('og:description');
    let ogTitle = getMeta('og:title');

    if (ogImg) ogImg = ogImg.replace(/&amp;/g, '&');
    if (ogDesc) ogDesc = ogDesc.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
    if (ogTitle) ogTitle = ogTitle.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');

    // Parse caption & date from ogDesc if present
    // Format example: "1 likes, 0 comments - shakarganjfoundation on July 27, 2026: "27th July 2026: Summer Calligraphy Camp at Shakarganj Foundation's Jhang Art Gallery"."
    let caption = ogTitle || "";
    let dateStr = "";
    
    if (ogDesc) {
      const matchDesc = ogDesc.match(/on ([^:]+):\s*"(.*)"/s) || ogDesc.match(/on ([^:]+):\s*(.*)/s);
      if (matchDesc) {
        dateStr = matchDesc[1].trim();
        caption = matchDesc[2].trim().replace(/^"/, '').replace(/"$/, '');
      }
    }

    return { url, ogImg, ogDesc, ogTitle, caption, dateStr };
  } catch (e) {
    return { url, error: e.message };
  }
}

async function run() {
  for (const url of postUrls) {
    const data = await scrapePost(url);
    console.log('RESULT:', JSON.stringify(data, null, 2));
  }
}

run();
