import re
import html
import json

with open("scripts/db2gd_embed.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Length:", len(content))

# Look for caption
cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
if cap_match:
    print("Caption raw:", cap_match.group(1)[:200])
    print("Caption clean:", html.unescape(re.sub(r'<[^>]+>', '', cap_match.group(1))).strip())
else:
    # search for caption in graph / json or text
    print("No class='Caption' found directly. Searching for text...")
    # search for caption text or title
    m_title = re.search(r'<title>(.*?)</title>', content)
    if m_title:
        print("Title:", html.unescape(m_title.group(1)))

# Search for images in any format
imgs = set()
for m in re.finditer(r'https://[^\s"\'\\]*?(?:scontent|cdninstagram)[^\s"\'\\]*', content):
    img_url = html.unescape(m.group(0)).replace('\\u0026', '&').replace('\\', '')
    imgs.add(img_url)

print(f"\nFound {len(imgs)} matching image URLs:")
for img in list(imgs)[:10]:
    print(" -", img[:120])

# Search for time / date
times = re.findall(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
print("\nTimes found:", times)

# Search for AdditionalDataLoaded or embedded json
json_matches = re.findall(r'window\.__additionalDataLoaded\s*\(\s*\'[^\']+\'\s*,\s*({.*?})\s*\);', content)
print("JSON matches count:", len(json_matches))

# Look for graphql or display_url / caption in script tags
captions = re.findall(r'"text":\s*"([^"]+)"', content)
print("Text strings count:", len(captions))
for c in captions[:5]:
    try:
        decoded = c.encode('utf-8').decode('unicode_escape')
        if len(decoded) > 10:
            print("  Caption candidate:", decoded[:150])
    except:
        pass
