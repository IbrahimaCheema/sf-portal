import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t51.82787-15/765957948_18015175277870863_6077682190498382864_n.webp?_nc_cat=104&_nc_map=urlgen_bucketless&ig_cache_key=Mzk1NzUxMDA0NzE3MTM1MTc3Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=4Sdytz95TXcQ7kNvwFykEp1&_nc_oc=AdqUy3iACTUdA2EbZWzYTQWWfPw69rR0plwnFMwEWLSAfQUVTR7-oSKDSV3lkEcguGg&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=5QVKZJ2JELDx9vcxbcZycA&_nc_ss=7b20f&oh=00_AQHVfZuKiDalJicYvucQI80fr6Lhx9_0Jyp5N5zcISSnmw&oe=6A79F7A6'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_file = os.path.join(out_dir, "temp_ig_post_13.webp")
out_jpg = os.path.join(out_dir, "hd_ig_post_13.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_file, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_13.webp, size:", len(data))

    img = Image.open(temp_file).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_file):
        os.remove(temp_file)

except Exception as e:
    print("Error downloading image:", e)
