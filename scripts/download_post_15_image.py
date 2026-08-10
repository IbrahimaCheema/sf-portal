import urllib.request
from PIL import Image
import os

img_url = 'https://instagram.flyp4-1.fna.fbcdn.net/v/t39.30808-6/768310240_1032893342960775_3938842050518541633_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&_nc_map=urlgen_bucketless&ig_cache_key=Mzk2MDM4MTMxMzU3MTk3MTI0Ng%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTI4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=MywrmG7jWSYQ7kNvwGHSPaU&_nc_oc=Adr_wZ2gj0LDeHXTuavrQwFPlN2vfe1SoF9xEEqgbdDwBOSoawqQKofr4ksWo5pJFAE&_nc_zt=23&_nc_ht=instagram.flyp4-1.fna&_nc_gid=HDEkR1KVQlfAaSfCXaB0dw&_nc_ss=7b60f&oh=00_AQGwq_6lD-QEgZ746h99FA-R-VPGN2JABT0vBs2gys1ECQ&oe=6A7F15E0'

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"
temp_file = os.path.join(out_dir, "temp_ig_post_15.jpg")
out_jpg = os.path.join(out_dir, "hd_ig_post_15.jpg")

req = urllib.request.Request(img_url, headers={
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
})

try:
    data = urllib.request.urlopen(req).read()
    with open(temp_file, "wb") as f:
        f.write(data)
    print("Downloaded temp_ig_post_15.jpg, size:", len(data))

    img = Image.open(temp_file).convert('RGB')
    print("Image dimensions:", img.size)
    img.save(out_jpg, quality=95)
    print(f"Saved {out_jpg} successfully!")
    
    if os.path.exists(temp_file):
        os.remove(temp_file)

except Exception as e:
    print("Error downloading image:", e)
