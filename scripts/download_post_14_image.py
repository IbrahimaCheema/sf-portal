import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t39.30808-6/765116513_1030376159879160_7088550514492464788_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&_nc_map=urlgen_bucketless&ig_cache_key=Mzk1ODIwNjgwNzI1NjQ1NjEwMg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTYwMC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=ML6IwJl49L0Q7kNvwGaCHpb&_nc_oc=AdpbiQDjtWHYzCTCMs-v7dEdJ01KsGVhqvx2N1jkUqhSZ0jqKZXMfyZ-xWu7uUZ3MlU&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=tvCWvfTuZznSr2ph8gxexA&_nc_ss=7b20f&oh=00_AQFikY19wqhLqIzDjfBKoaHsZv-8Ux51SMKdD1J3av41ww&oe=6A7B5C38'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_file = os.path.join(out_dir, "temp_ig_post_14.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_14.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_file, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_14.webp, size:", len(data))

    img = Image.open(temp_file).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_file):
        os.remove(temp_file)

except Exception as e:
    print("Error downloading image:", e)
