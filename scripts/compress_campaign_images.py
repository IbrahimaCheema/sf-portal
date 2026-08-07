import os
import sys
from PIL import Image

def compress_images(directory, max_dim=1200, quality=82):
    total_orig = 0
    total_new = 0
    processed_count = 0

    print(f"Starting image compression in: {directory}")
    print(f"Max dimension: {max_dim}px | JPEG Quality: {quality}%\n")

    for root, dirs, files in os.walk(directory):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                fp = os.path.join(root, f)
                orig_size = os.path.getsize(fp)
                total_orig += orig_size

                try:
                    with Image.open(fp) as img:
                        # Convert palette/transparent images for JPEG
                        if img.mode in ('RGBA', 'LA', 'P'):
                            bg = Image.new('RGB', img.size, (255, 255, 255))
                            if img.mode == 'P':
                                img = img.convert('RGBA')
                            bg.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                            img = bg
                        elif img.mode != 'RGB':
                            img = img.convert('RGB')

                        # Resize if larger than max_dim
                        w, h = img.size
                        if w > max_dim or h > max_dim:
                            if w >= h:
                                new_w = max_dim
                                new_h = int(h * (max_dim / w))
                            else:
                                new_h = max_dim
                                new_w = int(w * (max_dim / h))
                            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

                        # Save optimized JPEG
                        img.save(fp, 'JPEG', quality=quality, optimize=True, progressive=True)

                    new_size = os.path.getsize(fp)
                    total_new += new_size
                    processed_count += 1
                    
                    saved_kb = (orig_size - new_size) / 1024
                    # print sample progress every 25 files
                    if processed_count % 25 == 0 or processed_count == 1:
                        print(f"Processed [{processed_count}] {f}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (Saved {saved_kb:.1f} KB)")

                except Exception as e:
                    print(f"Error processing {fp}: {e}")
                    total_new += orig_size

    orig_mb = total_orig / (1024 * 1024)
    new_mb = total_new / (1024 * 1024)
    saved_mb = orig_mb - new_mb
    pct = (saved_mb / orig_mb * 100) if orig_mb > 0 else 0

    print("\n" + "="*50)
    print(f"Compression Complete!")
    print(f"Processed: {processed_count} images")
    print(f"Original Total Size: {orig_mb:.2f} MB")
    print(f"New Total Size:      {new_mb:.2f} MB")
    print(f"Space Saved:         {saved_mb:.2f} MB ({pct:.1f}% reduction)")
    print("="*50)

if __name__ == '__main__':
    target_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'images', 'campaigns')
    compress_images(target_dir)
