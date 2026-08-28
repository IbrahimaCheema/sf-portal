import urllib.request
import re
import html
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

shortcode = 'DckewZbEXro'
url = f'https://www.instagram.com/p/{shortcode}/embed/captioned/'
ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'

req = urllib.request.Request(url, headers={'User-Agent': ua})
res = urllib.request.urlopen(req)
content = res.read().decode('utf-8', errors='ignore')

# Extract caption
cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
caption_text = ""
if cap_match:
    raw_cap = cap_match.group(1)
    # Remove author link if at the beginning
    clean_cap = re.sub(r'<a class="CaptionUsername"[^>]*>.*?</a>', '', raw_cap)
    clean_cap = re.sub(r'<[^>]+>', '', clean_cap)
    caption_text = html.unescape(clean_cap).strip()
    print("--- RAW EXTRACTED CAPTION ---")
    print(repr(caption_text))

# Extract media images and srcset
media_img = re.findall(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.findall(r'src="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)
srcset_matches = re.findall(r'class="EmbeddedMediaImage"[^>]*srcset="([^"]+)"', content) or re.findall(r'srcset="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)

best_img_url = html.unescape(media_img[0]) if media_img else ""
if srcset_matches:
    srcset_entries = html.unescape(srcset_matches[0]).split(',')
    for entry in srcset_entries:
        parts = entry.strip().split(' ')
        src = parts[0]
        width = parts[1] if len(parts) > 1 else ""
        if "1080w" in width or not best_img_url:
            best_img_url = src

print("\n--- BEST IMAGE URL ---")
print(best_img_url)

# Extract datetime if present
time_match = re.search(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
datetime_val = ""
time_text = ""
if time_match:
    datetime_val = time_match.group(1)
    time_text = time_match.group(2)
    print(f"--- DATETIME: {datetime_val} ({time_text}) ---")

meta = {
    "url": f"https://www.instagram.com/p/{shortcode}/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "raw_caption": caption_text,
    "best_img_url": best_img_url,
    "datetime": datetime_val,
    "time_text": time_text
}

with open("scripts/post_26_meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)

print("\nSaved metadata to scripts/post_26_meta.json")
