import os
import shutil
import fitz  # PyMuPDF

src_dir = r"C:\Users\ibrah\Downloads\sf-newsletter"
dest_doc_dir = r"public\documents"
dest_img_dir = r"public\images\newsletters"

os.makedirs(dest_doc_dir, exist_ok=True)
os.makedirs(dest_img_dir, exist_ok=True)

pdfs = [f for f in os.listdir(src_dir) if f.endswith('.pdf')]

for pdf in pdfs:
    src_path = os.path.join(src_dir, pdf)
    
    # Safe name format: "SF_Newsletter_2023_24.pdf"
    safe_name = pdf.replace(" ", "_").replace("-", "_")
    dest_path = os.path.join(dest_doc_dir, safe_name)
    
    print(f"Copying {pdf} to {dest_doc_dir}...")
    shutil.copy2(src_path, dest_path)
    
    print(f"Extracting first page of {pdf}...")
    doc = fitz.open(dest_path)
    page = doc.load_page(0)
    
    # High resolution output (zoom = 2 -> 144 DPI)
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    img_name = safe_name.replace(".pdf", ".jpg").lower()
    img_dest = os.path.join(dest_img_dir, img_name)
    
    pix.save(img_dest)
    print(f"Saved cover image to {img_dest}")

print("Done processing PDFs.")
