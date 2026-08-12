import urllib.request
import re
import html
url = 'https://www.instagram.com/p/Db7QIK8DXvS/embed/captioned/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
res = urllib.request.urlopen(req)
content = res.read().decode('utf-8', errors='ignore')

out = []
cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
if cap_match:
    out.append('CAPTION: ' + html.unescape(re.sub(r'<[^>]+>', '', cap_match.group(1))).strip())
else:
    out.append('CAPTION: None')

img_match = re.findall(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.findall(r'src="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)
if img_match:
    out.append('IMAGE: ' + html.unescape(img_match[0]))
else:
    out.append('IMAGE: None')

time_match = re.search(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
if time_match:
    out.append('DATE: ' + time_match.group(2))
else:
    out.append('DATE: None')

with open("ig_out.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
