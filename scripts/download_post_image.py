import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t51.82787-15/765573025_18015036233870863_4001961435719085760_n.webp?_nc_cat=103&ig_cache_key=Mzk1Njc2MjE5ODkyNjE5NjUzMg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Sa1FqIXwbzMQ7kNvwELQOAA&_nc_oc=Adq-EybUWYR6ERIHwDlSI8QheolCP2eIYMh8f0uIz_WAH8CO_s8GH8Vsc3AniNWHv0s&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=q3Jd4Ukf_33x914N0kYu5Q&_nc_ss=7b60f&oh=00_AQEXIeYuDiUy9jKO5Xcsc_sW1-lf6O0cgvBbRTAcCVztIA&oe=6A78A01D'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_webp = os.path.join(out_dir, "temp_ig_post_12.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_12.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_webp, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_12.webp, size:", len(data))

    img = Image.open(temp_webp).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_webp):
        os.remove(temp_webp)

except Exception as e:
    print("Error downloading image:", e)
