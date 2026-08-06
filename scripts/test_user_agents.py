import urllib.request
import json
import html
import re

urls_to_try = [
    'https://api.instagram.com/oembed/?url=https://www.instagram.com/p/DbpPliJjMAW/',
    'https://www.instagram.com/p/DbpPliJjMAW/embed/captioned/',
    'https://www.instagram.com/p/DbpPliJjMAW/?__a=1&__d=dis'
]

user_agents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Twitterbot/1.0'
]

for url in urls_to_try:
    for ua in user_agents:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': ua})
            res = urllib.request.urlopen(req, timeout=5)
            data = res.read().decode('utf-8', errors='ignore')
            print(f"SUCCESS for URL: {url} | UA: {ua[:30]} | Length: {len(data)}")
            if "oembed" in url or data.startswith("{"):
                print("JSON DATA:\n", data[:500])
            else:
                # search for caption and img
                cap = re.search(r'class="Caption"[^>]*>(.*?)</div>', data, re.DOTALL) or re.search(r'class="CaptionComments"[^>]*>(.*?)</div>', data, re.DOTALL)
                img = re.findall(r'https://[^\s"\'\\]*?scontent[^\s"\'\\]*', data)
                if cap:
                    print("CAPTION:", re.sub(r'<[^>]+>', '', cap.group(1)).strip()[:200])
                if img:
                    print("IMGS:", [html.unescape(i) for i in set(img[:3])])
            break
        except Exception as e:
            pass
