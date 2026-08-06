import urllib.request
import re
import json

url = "https://www.instagram.com/shakarganjfoundation/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        shortcodes = list(dict.fromkeys(re.findall(r'/p/([A-Za-z0-9_-]+)/', html)))
        print("Found shortcodes in profile HTML:", shortcodes)
        for sc in shortcodes[:4]:
            print(f"Post URL: https://www.instagram.com/p/{sc}/")
except Exception as e:
    print("Error:", e)
