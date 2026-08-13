import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t51.82787-15/774515255_18016076456870863_607434127602313616_n.webp?_nc_cat=106&_nc_map=urlgen_bucketless&ig_cache_key=Mzk2MjUzNjk4MzMyMDk2NTYxOQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Ln9MBloPnFEQ7kNvwHyE63D&_nc_oc=Adqx-rU2julHFHQWMVfEyWciNdekQ-lPRrFJAWNPBx_OvtdWjkVfAvSy-8wJ2sGCpG8&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=QCku9FGwElFnAx5NKOJ1sQ&_nc_ss=7b60f&oh=00_AQGaUwx8fbFt7TokIs8buxabzNBXjlueUrymFaIi7xMIiw&oe=6A83A3BB'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_webp = os.path.join(out_dir, "temp_ig_post_18.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_18.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_webp, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_18.webp, size:", len(data))

    img = Image.open(temp_webp).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_webp):
        os.remove(temp_webp)

except Exception as e:
    print("Error downloading image:", e)
