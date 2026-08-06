import urllib.request
import re
import json
import html as html_lib

post_urls = [
    "https://www.instagram.com/p/DbUVavJCFzC/",
    "https://www.instagram.com/p/C-X-0LSM67n/",
]

def scrape_instagram_post(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    )
    try:
        with urllib.request.urlopen(req) as response:
            html_text = response.read().decode('utf-8')
            
            # Extract og:image
            img_match = re.search(r'property="og:image"\s+content="([^"]+)"', html_text) or re.search(r'content="([^"]+)"\s+property="og:image"', html_text)
            img_url = html_lib.unescape(img_match.group(1)) if img_match else None
            
            # Extract og:description
            desc_match = re.search(r'property="og:description"\s+content="([^"]+)"', html_text) or re.search(r'content="([^"]+)"\s+property="og:description"', html_text)
            desc_text = html_lib.unescape(desc_match.group(1)) if desc_match else None
            
            # Extract og:title
            title_match = re.search(r'property="og:title"\s+content="([^"]+)"', html_text) or re.search(r'content="([^"]+)"\s+property="og:title"', html_text)
            title_text = html_lib.unescape(title_match.group(1)) if title_match else None
            
            # Parse description into caption and date
            caption = title_text or ""
            date_str = ""
            if desc_text:
                # Example desc_text: 1 likes, 0 comments - shakarganjfoundation on July 27, 2026: "27th July 2026: Summer Calligraphy Camp at Shakarganj Foundation's Jhang Art Gallery".
                parsed = re.search(r'on ([^:]+):\s*"(.*)"', desc_text, re.DOTALL) or re.search(r'on ([^:]+):\s*(.*)', desc_text, re.DOTALL)
                if parsed:
                    date_str = parsed.group(1).strip()
                    caption = parsed.group(2).strip().rstrip('.').strip('"')
            
            return {
                "url": url,
                "featureImage": img_url,
                "caption": caption,
                "date": date_str,
                "raw_description": desc_text
            }
    except Exception as e:
        return {"url": url, "error": str(e)}

results = [scrape_instagram_post(u) for u in post_urls]
print(json.dumps(results, indent=2))
