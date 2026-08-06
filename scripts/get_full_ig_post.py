import urllib.request
import re
import html

url = 'https://www.instagram.com/p/DbpPliJjMAW/embed/captioned/'
ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'

req = urllib.request.Request(url, headers={'User-Agent': ua})
res = urllib.request.urlopen(req)
content = res.read().decode('utf-8', errors='ignore')

with open("scripts/ig_embed_full.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved ig_embed_full.html, length:", len(content))

# Extract caption
cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
if cap_match:
    raw_cap = cap_match.group(1)
    clean_cap = re.sub(r'<[^>]+>', '', raw_cap)
    print("CAPTION TEXT:\n", html.unescape(clean_cap).strip())

# Extract all images in EmbeddedMedia or img tags
img_srcs = re.findall(r'<img[^>]+src="([^"]+)"', content)
print("\nALL IMG SRCS:")
for s in img_srcs:
    clean_s = html.unescape(s)
    if "scontent" in clean_s or "cdninstagram" in clean_s:
        print("  -", clean_s)

# Extract EmbeddedMediaImage specifically
media_img = re.findall(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.findall(r'src="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)
print("\nMEDIA IMG SRCS:")
for m in media_img:
    print("  -", html.unescape(m))

# Extract time / date
time_match = re.search(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
if time_match:
    print("\nTIME DATETIME:", time_match.group(1))
    print("TIME TEXT:", time_match.group(2))
