from PIL import Image
import os

img = Image.open(r"C:\Users\ibrah\.gemini\antigravity-ide\brain\0eb72012-2a12-4e33-a028-e7367bbc1a77\media__1785253152260.png")
out_dir = r"c:\Users\ibrah\Downloads\antigravity-ide\sf-portal\public\images"

width, height = img.size
print(f"media__1785253152260.png dimensions: {width}x{height}")

# In media__1785253152260.png (1024x528), Post 4 is "Service Above Self"
# Grid start Y ~ 250..490
# Col 4 X ~ 524..670
c4 = img.crop((524, 250, 670, 490))
c4.save(os.path.join(out_dir, "real_ig_card_4.png"))
print("Cropped real_ig_card_4.png!")
