import urllib.request
import re
import html

url = 'https://www.instagram.com/p/DbpPliJjMAW/embed/captioned/'
req = urllib.request.Request(
    url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
)
try:
    resp = urllib.request.urlopen(req)
    content = resp.read().decode('utf-8')
    print("Content length:", len(content))
    with open("scripts/embed_captioned.html", "w", encoding="utf-8") as f:
        f.write(content)

    # Search for Caption class or text
    caption_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
    if caption_match:
        cap_text = re.sub(r'<[^>]+>', '', caption_match.group(1))
        print("CAPTION FOUND:\n", html.unescape(cap_text).strip())

    # Search for EmbeddedMediaImage or img src
    img_match = re.search(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.search(r'<img[^>]+class="[^"]*FFVAD[^"]*"[^>]*src="([^"]+)"', content) or re.search(r'<img[^>]+src="([^"]+)"[^>]+class="[^"]*EmbeddedMediaImage', content)
    if img_match:
        print("IMAGE URL FOUND:\n", html.unescape(img_match.group(1)))
    else:
        # find any scontent or cdninstagram img url
        imgs = re.findall(r'https://[^\s"\'\\]*?scontent[^\s"\'\\]*', content)
        print("SCONTENT IMGS:", [html.unescape(i) for i in set(imgs)])

    # Search for date
    date_match = re.search(r'time[^>]*datetime="([^"]+)"', content) or re.search(r'class="[^"]*Time[^"]*"[^>]*>(.*?)<', content)
    if date_match:
        print("DATE FOUND:", date_match.group(1))

except Exception as e:
    print("Error:", e)
