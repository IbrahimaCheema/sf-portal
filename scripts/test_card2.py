import urllib.request
import re
import html as html_lib

url = "https://www.instagram.com/p/DbSLhhwDGF1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="

req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        img_match = re.search(r'property="og:image"\s+content="([^"]+)"', content) or re.search(r'content="([^"]+)"\s+property="og:image"', content)
        desc_match = re.search(r'property="og:description"\s+content="([^"]+)"', content) or re.search(r'content="([^"]+)"\s+property="og:description"', content)
        
        img = html_lib.unescape(img_match.group(1)) if img_match else "NONE"
        desc = html_lib.unescape(desc_match.group(1)) if desc_match else "NONE"
        print("IMG:", img)
        print("DESC:", desc)
except Exception as e:
    print("Error:", e)
