import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t51.82787-15/772840314_18015835247870863_1985780022812946878_n.webp?_nc_cat=103&_nc_map=urlgen_bucketless&ig_cache_key=Mzk2MTEyOTMzNzc0NTQxNjc4Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=6BT99rjAg4sQ7kNvwFfha69&_nc_oc=AdqWyEf0uDDDNPhqhRQ2F-nq3siz8x8eWn-i0nbbz2QK0tnPBBQy8yvWbT_hObhDKng&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=1QFxRi-JXl1RMgtBInHBcg&_nc_ss=7b20f&oh=00_AQFJmF0K5bmFDnCntMchKfBSjO_fBOYmHpYFUPltEJ027g&oe=6A80936F'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_file = os.path.join(out_dir, "temp_ig_post_16.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_16.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_file, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_16.webp, size:", len(data))

    img = Image.open(temp_file).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_file):
        os.remove(temp_file)

except Exception as e:
    print("Error downloading image:", e)
