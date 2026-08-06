import re

with open("scripts/ig_page.html", "r", encoding="utf-8") as f:
    html = f.read()

print("HTML Length:", len(html))

# Print all meta tags
metas = re.findall(r'<meta[^>]+>', html)
print("Total meta tags:", len(metas))
for m in metas:
    print("META:", m)

# Search for any image links (cdninstagram.com or fbcdn.net)
images = re.findall(r'https://[^\s"\'\\]*?(?:cdninstagram|fbcdn)[^\s"\'\\]*', html)
print("\nCDN Image URLs found:", len(images))
for img in set(images[:10]):
    print("IMG:", img.replace(r'\u0026', '&'))

# Search for title or heading text
title = re.search(r'<title>(.*?)</title>', html)
print("\nTITLE:", title.group(1) if title else "No title")
