from PIL import Image
import glob
import os

for f in sorted(glob.glob('public/images/*.*')):
    try:
        im = Image.open(f)
        print(f"{os.path.basename(f)}: {im.size[0]}x{im.size[1]}px")
    except Exception as e:
        pass
