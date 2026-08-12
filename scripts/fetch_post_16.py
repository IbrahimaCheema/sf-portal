import urllib.request
import re
import html
import json

url = 'https://www.instagram.com/p/Db4wkUjjHeG/embed/captioned/'
ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
req = urllib.request.Request(url, headers={'User-Agent': ua})

try:
    content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    
    result = {}
    
    cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
    if cap_match:
        clean_cap = re.sub(r'<[^>]+>', '', cap_match.group(1))
        result['caption'] = html.unescape(clean_cap).strip()
    
    imgs = re.findall(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.findall(r'src="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)
    if not imgs:
        imgs = [html.unescape(s) for s in re.findall(r'<img[^>]+src="([^"]+)"', content) if "scontent" in s or "cdninstagram" in s]
    else:
        imgs = [html.unescape(s) for s in imgs]
    
    result['images'] = imgs
    
    time_match = re.search(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
    if time_match:
        result['datetime'] = time_match.group(1)
        result['time_text'] = html.unescape(time_match.group(2))
    
    print(json.dumps(result, indent=2))
    
except Exception as e:
    print("Error:", e)
