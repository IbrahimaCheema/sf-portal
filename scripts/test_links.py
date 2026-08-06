import urllib.request
import re
import html as html_lib

urls = [
    "https://www.instagram.com/p/DbUVavJCFzC/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "https://www.instagram.com/p/DbUVavJCFzC/",
    "https://www.instagram.com/p/C9H7m5dM8xy/",
    "https://www.instagram.com/shakarganjfoundation/"
]

def check_url(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            code = resp.status
            content = resp.read().decode('utf-8', errors='ignore')
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            title = html_lib.unescape(title_match.group(1)) if title_match else "No Title"
            return {"url": url, "code": code, "title": title}
    except Exception as e:
        return {"url": url, "error": str(e)}

for u in urls:
    print(check_url(u))
