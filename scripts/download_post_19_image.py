import urllib.request
from PIL import Image
import os
import json

with open("scripts/post_19_meta.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

img_url = meta["best_img_url"]
print("Downloading image from URL:", img_url)

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_webp = os.path.join(out_dir, "temp_ig_post_19.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_19.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_webp, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_19.webp, size:", len(data))

    img = Image.open(temp_webp).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully! Size: {os.path.getsize(out_jpg)} bytes")
    
    if os.path.exists(temp_webp):
        os.remove(temp_webp)

except Exception as e:
    print("Error downloading image:", e)
