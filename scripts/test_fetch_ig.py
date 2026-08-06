import urllib.request
import re
import json

url = 'https://www.instagram.com/p/DbpPliJjMAW/'
req = urllib.request.Request(
    url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
)
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    with open("scripts/ig_page.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved ig_page.html")

    # Search for display_url
    display_urls = re.findall(r'"display_url"\s*:\s*"([^"]+)"', html)
    print("Display URLs found:", len(display_urls))
    for d in display_urls[:3]:
        print("  -", d.replace(r'\u0026', '&'))

    # Search for captions / text
    captions = re.findall(r'"text"\s*:\s*"([^"]+)"', html)
    print("Captions text found:", len(captions))
    for c in captions[:5]:
        print("  -", c.encode('utf-8', errors='ignore').decode('utf-8'))

    # Search for meta tag content
    metas = re.findall(r'<meta[^>]+>', html)
    for m in metas:
        if 'og:' in m or 'twitter:' in m or 'description' in m or 'title' in m:
            print("META:", m)

except Exception as e:
    print('Error:', e)
