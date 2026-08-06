from PIL import Image, ImageEnhance
import os

src_img1 = Image.open(r"C:\Users\ibrah\.gemini\antigravity-ide\brain\0eb72012-2a12-4e33-a028-e7367bbc1a77\media__1785252504033.png")
src_img2 = Image.open(r"C:\Users\ibrah\.gemini\antigravity-ide\brain\0eb72012-2a12-4e33-a028-e7367bbc1a77\media__1785253152260.png")

out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"

# 1. Post 1: Use post_1_feature.jpg (640x640 high res)
p1 = Image.open(os.path.join(out_dir, "post_1_feature.jpg")).convert('RGB')
p1.save(os.path.join(out_dir, "hd_ig_post_1.jpg"), quality=95)

# 2. Post 2 (Fashion class in green scarf)
p2 = src_img1.crop((370, 146, 653, 345)).convert('RGB')
p2_hd = p2.resize((640, 450), Image.Resampling.LANCZOS)
p2_hd = ImageEnhance.Sharpness(p2_hd).enhance(1.4)
p2_hd.save(os.path.join(out_dir, "hd_ig_post_2.jpg"), quality=95)

# 3. Post 3 (Calligraphy classroom)
p3 = src_img1.crop((686, 146, 970, 345)).convert('RGB')
p3_hd = p3.resize((640, 450), Image.Resampling.LANCZOS)
p3_hd = ImageEnhance.Sharpness(p3_hd).enhance(1.4)
p3_hd.save(os.path.join(out_dir, "hd_ig_post_3.jpg"), quality=95)

# 4. Post 4 (Service Above Self / Publication): Clean crop starting Y=335 (100% white background publication card!)
p4 = src_img2.crop((532, 335, 668, 480)).convert('RGB')
p4_hd = p4.resize((640, 450), Image.Resampling.LANCZOS)
p4_hd = ImageEnhance.Sharpness(p4_hd).enhance(1.4)
p4_hd.save(os.path.join(out_dir, "hd_ig_post_4.jpg"), quality=95)

print("Generated perfectly clean HD images!")
