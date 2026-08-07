import os
import sys
import mimetypes
import boto3
from botocore.client import Config
from dotenv import load_dotenv

load_dotenv()

account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID')
access_key = os.getenv('R2_ACCESS_KEY_ID')
secret_key = os.getenv('R2_SECRET_ACCESS_KEY')
bucket_name = os.getenv('R2_BUCKET_NAME')
public_domain = os.getenv('R2_PUBLIC_DOMAIN', 'https://docs.sf.org.pk')

if not account_id or not access_key or not secret_key or not bucket_name:
    print("Error: Missing R2 environment variables in .env")
    sys.exit(1)

endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

s3 = boto3.client('s3',
    endpoint_url=endpoint_url,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    region_name='auto',
    config=Config(signature_version='s3v4')
)

def upload_campaign_images():
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
    base_dir = os.path.join(public_dir, 'images', 'campaigns')
    
    if not os.path.exists(base_dir):
        print(f"Error: Directory {base_dir} does not exist.")
        sys.exit(1)

    print(f"Uploading files from {base_dir} to Cloudflare R2 bucket '{bucket_name}'...")
    
    success_count = 0
    total_bytes = 0

    for root, dirs, files in os.walk(base_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, public_dir)
            s3_key = rel_path.replace('\\', '/')

            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'image/jpeg' if file_path.lower().endswith(('.jpg', '.jpeg')) else 'application/octet-stream'

            file_size = os.path.getsize(file_path)

            try:
                with open(file_path, 'rb') as f:
                    s3.put_object(
                        Bucket=bucket_name,
                        Key=s3_key,
                        Body=f,
                        ContentType=mime_type,
                        CacheControl='public, max-age=31536000, immutable'
                    )
                success_count += 1
                total_bytes += file_size
                if success_count % 25 == 0 or success_count == 1:
                    print(f"Uploaded [{success_count}] {s3_key} ({file_size/1024:.1f} KB)")
            except Exception as e:
                print(f"Failed to upload {s3_key}: {e}")

    print("\n" + "="*50)
    print(f"Cloudflare R2 Upload Complete!")
    print(f"Successfully uploaded: {success_count} files")
    print(f"Total uploaded size:  {total_bytes / (1024 * 1024):.2f} MB")
    print(f"Base R2 Domain:        {public_domain}")
    print("="*50)

if __name__ == '__main__':
    upload_campaign_images()
