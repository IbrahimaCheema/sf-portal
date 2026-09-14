#!/usr/bin/env python3
"""
Autonomous Instagram Social Media Sync Engine for SF-Portal
============================================================
Orchestrated by: IT Operations Command Center (COO Agent)

Workflow:
1. Discovers the latest post shortcode from @shakarganjfoundation via Playwright.
2. Checks ActivitiesEvents.astro to verify if post was already processed (idempotent deduplication).
3. If new:
   - Fetches captioned embed metadata (caption, best 1080w image, date).
   - Normalizes date typos and sanitizes caption unicode/emojis.
   - Downloads uncropped high-resolution photo to public/images/hd_ig_post_{N}.jpg.
   - Uploads to Cloudflare R2 bucket (docs.sf.org.pk).
   - Inserts entry into rawDefaultPosts in ActivitiesEvents.astro.
   - Executes Astro production build validation (npm run build).
   - Performs git commit and push to origin main (compliant with AGENTS.md rules).
   - Appends detailed record to logs/social_sync_audit.log.
"""

import os
import sys

# Force UTF-8 encoding across all Windows stdout/stderr streams
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

import re
import json
import html
import argparse
import subprocess
from datetime import datetime
import urllib.request
from PIL import Image

try:
    import boto3
except ImportError:
    boto3 = None

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_DIR = os.path.join(BASE_DIR, "src")
COMPONENTS_DIR = os.path.join(SRC_DIR, "components")
ACTIVITIES_FILE = os.path.join(COMPONENTS_DIR, "ActivitiesEvents.astro")
PUBLIC_IMAGES_DIR = os.path.join(BASE_DIR, "public", "images")
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
LOGS_DIR = os.path.join(BASE_DIR, "logs")
ENV_FILE = os.path.join(BASE_DIR, ".env")
AUDIT_LOG_FILE = os.path.join(LOGS_DIR, "social_sync_audit.log")

INSTAGRAM_ACCOUNT_URL = "https://www.instagram.com/shakarganjfoundation/"

MONTH_LOOKUP = {
    "jan": "January", "feb": "February", "mar": "March", "apr": "April",
    "may": "May", "jun": "June", "jul": "July", "aug": "August",
    "sep": "September", "oct": "October", "nov": "November", "dec": "December"
}


def log(msg, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] [{level}] {msg}"
    try:
        print(formatted)
    except Exception:
        try:
            print(formatted.encode("ascii", errors="replace").decode("ascii"))
        except Exception:
            pass
    try:
        os.makedirs(LOGS_DIR, exist_ok=True)
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception as e:
        pass


def load_env():
    """Load configuration variables from .env file."""
    env_vars = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars


def get_latest_post_shortcode_from_profile():
    """Scrape @shakarganjfoundation profile using Playwright headless Chromium."""
    log("Navigating to Instagram profile via Playwright headless browser...")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log("Error: playwright is not installed. Install via pip install playwright", level="ERROR")
        sys.exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        try:
            page.goto(INSTAGRAM_ACCOUNT_URL, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(5000)
            links = page.query_selector_all("a")
            for link in links:
                href = link.get_attribute("href") or ""
                m = re.search(r"/p/([A-Za-z0-9_-]+)/?", href)
                if m:
                    shortcode = m.group(1)
                    browser.close()
                    log(f"Discovered latest post shortcode from profile: {shortcode}")
                    return shortcode
        except Exception as e:
            browser.close()
            log(f"Playwright navigation failed: {e}", level="ERROR")
            raise

    browser.close()
    return None


def extract_shortcode(url_or_code):
    """Extract clean shortcode from full URL or return code directly."""
    m = re.search(r"/p/([A-Za-z0-9_-]+)/?", url_or_code)
    if m:
        return m.group(1)
    return url_or_code.strip()


def is_already_processed(shortcode):
    """Check if the shortcode is already present in ActivitiesEvents.astro."""
    if not os.path.exists(ACTIVITIES_FILE):
        log(f"Critical: {ACTIVITIES_FILE} does not exist!", level="ERROR")
        return False
    with open(ACTIVITIES_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    return shortcode in content


def get_next_post_number():
    """Determine next post index N by inspecting ActivitiesEvents.astro and scripts/."""
    max_num = 0
    if os.path.exists(ACTIVITIES_FILE):
        with open(ACTIVITIES_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            matches = re.findall(r"hd_ig_post_(\d+)\.jpg", content)
            if matches:
                max_num = max(max_num, max(int(x) for x in matches))

    if os.path.exists(SCRIPTS_DIR):
        for fname in os.listdir(SCRIPTS_DIR):
            m = re.match(r"post_(\d+)_meta\.json", fname)
            if m:
                max_num = max(max_num, int(m.group(1)))

    return max_num + 1


def fetch_embed_metadata(shortcode):
    """Fetch caption and best image URL from Instagram captioned embed endpoint."""
    embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
    ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

    req = urllib.request.Request(embed_url, headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        log(f"Failed to fetch embed for {shortcode}: {e}", level="ERROR")
        raise

    # Extract caption
    caption_text = ""
    cap_match = re.search(r'class="Caption"[^>]*>(.*?)</div>', content, re.DOTALL)
    if cap_match:
        raw_cap = cap_match.group(1)
        clean_cap = re.sub(r'<a class="CaptionUsername"[^>]*>.*?</a>', '', raw_cap)
        clean_cap = re.sub(r'<[^>]+>', '', clean_cap)
        caption_text = html.unescape(clean_cap).strip()

    # Extract best image URL
    media_img = re.findall(r'class="EmbeddedMediaImage"[^>]*src="([^"]+)"', content) or re.findall(r'src="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)
    srcset_matches = re.findall(r'class="EmbeddedMediaImage"[^>]*srcset="([^"]+)"', content) or re.findall(r'srcset="([^"]+)"[^>]*class="EmbeddedMediaImage"', content)

    best_img_url = html.unescape(media_img[0]) if media_img else ""
    if srcset_matches:
        srcset_entries = html.unescape(srcset_matches[0]).split(",")
        for entry in srcset_entries:
            parts = entry.strip().split(" ")
            src = parts[0]
            width = parts[1] if len(parts) > 1 else ""
            if "1080w" in width or not best_img_url:
                best_img_url = src

    # Extract datetime if present
    time_match = re.search(r'<time[^>]*datetime="([^"]+)"[^>]*>(.*?)</time>', content)
    datetime_val = time_match.group(1) if time_match else ""
    time_text = time_match.group(2) if time_match else ""

    return {
        "shortcode": shortcode,
        "url": f"https://www.instagram.com/p/{shortcode}/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
        "raw_caption": caption_text,
        "best_img_url": best_img_url,
        "datetime": datetime_val,
        "time_text": time_text
    }


def parse_caption_and_date(raw_caption, datetime_val):
    """Clean caption, normalize month names, and format date string matching ActivitiesEvents.astro format."""
    current_year = datetime.now().year
    if datetime_val:
        try:
            dt = datetime.fromisoformat(datetime_val.replace("Z", "+00:00"))
            current_year = dt.year
        except Exception:
            pass

    # Pattern 1: Leading date prefix with day first:
    # e.g. "11th September,2026: ...", "11th September 2026: ...", "21stAugust: ...", "4th September: ...", "11 Sep, 2026: ..."
    p1 = re.match(
        r"^\s*(\d{1,2})(?:st|nd|rd|th)?\s*([A-Za-z]+)(?:[,\s\-]+(\d{4}))?\s*[:\-–—]\s*(.*)$",
        raw_caption,
        re.DOTALL | re.IGNORECASE
    )
    if p1:
        day = int(p1.group(1))
        month_raw = p1.group(2).lower()
        year = p1.group(3) if p1.group(3) else str(current_year)
        clean_cap = p1.group(4).strip()
        prefix = month_raw[:3]
        if prefix in MONTH_LOOKUP:
            month_clean = MONTH_LOOKUP[prefix]
            return clean_cap, f"{day} {month_clean}, {year}"

    # Pattern 2: Leading date prefix with month first:
    # e.g. "September 11, 2026: ...", "August 21st, 2026: ..."
    p2 = re.match(
        r"^\s*([A-Za-z]+)\s*(\d{1,2})(?:st|nd|rd|th)?(?:[,\s\-]+(\d{4}))?\s*[:\-–—]\s*(.*)$",
        raw_caption,
        re.DOTALL | re.IGNORECASE
    )
    if p2:
        month_raw = p2.group(1).lower()
        day = int(p2.group(2))
        year = p2.group(3) if p2.group(3) else str(current_year)
        clean_cap = p2.group(4).strip()
        prefix = month_raw[:3]
        if prefix in MONTH_LOOKUP:
            month_clean = MONTH_LOOKUP[prefix]
            return clean_cap, f"{day} {month_clean}, {year}"

    # Pattern 3: Leading numeric date: "11/09/2026: ...", "11-09-2026: ..."
    p3 = re.match(
        r"^\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\s*[:\-–—]\s*(.*)$",
        raw_caption,
        re.DOTALL
    )
    if p3:
        d = int(p3.group(1))
        m = int(p3.group(2))
        y = int(p3.group(3))
        if y < 100:
            y += 2000
        if 1 <= m <= 12 and 1 <= d <= 31:
            try:
                month_name = datetime(y, m, d).strftime("%B")
                clean_cap = p3.group(4).strip()
                return clean_cap, f"{d} {month_name}, {y}"
            except ValueError:
                pass

    # Pattern 4: Embedded date in text, e.g. "on August 28th - 2026", "On August 27, 2026,"
    p4 = re.search(
        r"(?:on\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s\-]+(\d{4}))",
        raw_caption,
        re.IGNORECASE
    )
    if p4:
        prefix = p4.group(1).lower()[:3]
        if prefix in MONTH_LOOKUP:
            month_clean = MONTH_LOOKUP[prefix]
            day = int(p4.group(2))
            year = p4.group(3) if p4.group(3) else str(current_year)
            return raw_caption, f"{day} {month_clean}, {year}"

    # Pattern 5: Embedded date with day first: "on 28th August 2026"
    p5 = re.search(
        r"(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s*([A-Za-z]+)(?:[,\s\-]+(\d{4}))",
        raw_caption,
        re.IGNORECASE
    )
    if p5:
        prefix = p5.group(2).lower()[:3]
        if prefix in MONTH_LOOKUP:
            month_clean = MONTH_LOOKUP[prefix]
            day = int(p5.group(1))
            year = p5.group(3) if p5.group(3) else str(current_year)
            return raw_caption, f"{day} {month_clean}, {year}"

    # Fallback to ISO datetime if available
    if datetime_val:
        try:
            dt = datetime.fromisoformat(datetime_val.replace("Z", "+00:00"))
            return raw_caption, f"{dt.day} {dt.strftime('%B')}, {dt.year}"
        except Exception:
            pass

    now = datetime.now()
    return raw_caption, f"{now.day} {now.strftime('%B')}, {now.year}"


def download_image(img_url, post_num):
    """Download the high-resolution image and save as JPEG with quality=95."""
    os.makedirs(PUBLIC_IMAGES_DIR, exist_ok=True)
    temp_file = os.path.join(PUBLIC_IMAGES_DIR, f"temp_ig_post_{post_num}_raw")
    out_jpg = os.path.join(PUBLIC_IMAGES_DIR, f"hd_ig_post_{post_num}.jpg")

    req = urllib.request.Request(img_url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    })

    log(f"Downloading image from CDN for Post {post_num}...")
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()

    with open(temp_file, "wb") as f:
        f.write(data)

    img = Image.open(temp_file).convert("RGB")
    log(f"Image dimensions: {img.size[0]}x{img.size[1]} px. Saving uncropped JPEG: {out_jpg}")
    img.save(out_jpg, quality=95)

    if os.path.exists(temp_file):
        os.remove(temp_file)

    return out_jpg


def upload_to_r2(local_file_path, post_num, env_vars):
    """Upload post JPEG asset to Cloudflare R2 bucket."""
    account_id = env_vars.get("CLOUDFLARE_ACCOUNT_ID") or env_vars.get("R2_ACCOUNT_ID")
    access_key = env_vars.get("R2_ACCESS_KEY_ID")
    secret_key = env_vars.get("R2_SECRET_ACCESS_KEY")
    bucket_name = env_vars.get("R2_BUCKET_NAME", "sf-uploads")

    if not (account_id and access_key and secret_key):
        raise ValueError("Missing Cloudflare R2 credentials in .env file!")

    key = f"images/hd_ig_post_{post_num}.jpg"
    log(f"Uploading {key} to Cloudflare R2 bucket '{bucket_name}'...")

    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto"
    )

    with open(local_file_path, "rb") as f:
        s3.upload_fileobj(
            f,
            bucket_name,
            key,
            ExtraArgs={"ContentType": "image/jpeg"}
        )

    public_url = f"https://docs.sf.org.pk/{key}"
    log(f"? Cloudflare R2 upload verified: {public_url}")
    return public_url


def update_astro_component(post_entry):
    """Prepend the new post object into rawDefaultPosts in ActivitiesEvents.astro."""
    with open(ACTIVITIES_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    marker = "const rawDefaultPosts = [\n"
    if marker not in content:
        raise ValueError(f"Could not locate marker '{marker}' in {ACTIVITIES_FILE}")

    safe_caption = post_entry["caption"].replace('\\', '\\\\').replace('"', '\\"')
    new_entry_str = f"""  {{
    url: "{post_entry['url']}",
    featureImage: "{post_entry['featureImage']}",
    caption: "{safe_caption}",
    date: "{post_entry['date']}"
  }},
"""
    updated_content = content.replace(marker, marker + new_entry_str, 1)

    with open(ACTIVITIES_FILE, "w", encoding="utf-8") as f:
        f.write(updated_content)

    log(f"? Updated {ACTIVITIES_FILE} with Post {post_entry['post_num']}")


def run_build_check():
    """Run npm run build to verify site compiles cleanly."""
    log("Running 'npm run build' validation gate...")
    res = subprocess.run(
        ["npm.cmd", "run", "build"],
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )
    if res.returncode != 0:
        log(f"Build failed with code {res.returncode}:\n{res.stderr}\n{res.stdout}", level="ERROR")
        return False
    log("? Site build passed with zero errors!")
    return True


def commit_and_push(post_num, caption_summary):
    """Git commit changes and push to origin main."""
    log(f"Staging files for Post {post_num}...")
    subprocess.run(["git", "add", "src/components/ActivitiesEvents.astro", f"scripts/post_{post_num}_meta.json"], cwd=BASE_DIR, check=True)

    commit_msg = f"feat(activities): add new Instagram post {post_num} ({caption_summary})"
    log(f"Committing: {commit_msg}")
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, check=True)

    log("Pushing commit to origin main...")
    push_res = subprocess.run(["git", "push", "origin", "main"], cwd=BASE_DIR, capture_output=True, text=True)
    if push_res.returncode != 0:
        log(f"Git push failed: {push_res.stderr}", level="ERROR")
        raise RuntimeError(f"Git push failed: {push_res.stderr}")

    log("? Successfully pushed to origin main! Cloudflare Pages build triggered.")


def main():
    parser = argparse.ArgumentParser(description="Autonomous Instagram Sync Agent for SF-Portal")
    parser.add_argument("--url", help="Direct Instagram post URL to add", default=None)
    parser.add_argument("--dry-run", action="store_true", help="Simulate run without modifying files or git push")
    parser.add_argument("--force", action="store_true", help="Force processing even if shortcode already exists")
    args = parser.parse_args()

    log("================================================================================")
    log("Starting Instagram Social Media Sync Execution")
    log("================================================================================")

    if args.url:
        shortcode = extract_shortcode(args.url)
        log(f"Manual input provided: shortcode '{shortcode}'")
    else:
        shortcode = get_latest_post_shortcode_from_profile()

    if not shortcode:
        log("No Instagram post shortcode found. Exiting.", level="WARNING")
        sys.exit(0)

    if not args.force and is_already_processed(shortcode):
        log(f"Post '{shortcode}' is ALREADY present in ActivitiesEvents.astro. Zero action needed (No duplicate).")
        log("================================================================================")
        sys.exit(0)

    log(f"Post '{shortcode}' is NEW! Proceeding with publication pipeline...")

    post_num = get_next_post_number()
    log(f"Target Post Index: {post_num}")

    meta = fetch_embed_metadata(shortcode)
    clean_caption, formatted_date = parse_caption_and_date(meta["raw_caption"], meta["datetime"])

    log(f"Extracted Date: {formatted_date}")
    log(f"Extracted Caption: {clean_caption}")
    log(f"Best Image URL: {meta['best_img_url']}")

    if args.dry_run:
        log(f"[DRY-RUN] Would download image, upload to R2, insert into ActivitiesEvents.astro, build, and push Post {post_num}.")
        log("================================================================================")
        sys.exit(0)

    meta_path = os.path.join(SCRIPTS_DIR, f"post_{post_num}_meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    log(f"Saved metadata: {meta_path}")

    local_image = download_image(meta["best_img_url"], post_num)

    env_vars = load_env()
    r2_url = upload_to_r2(local_image, post_num, env_vars)

    post_entry = {
        "post_num": post_num,
        "url": meta["url"],
        "featureImage": r2_url,
        "caption": clean_caption,
        "date": formatted_date
    }
    update_astro_component(post_entry)

    build_ok = run_build_check()
    if not build_ok:
        log("BUILD FAILED! Rolling back ActivitiesEvents.astro...", level="ERROR")
        subprocess.run(["git", "checkout", "--", "src/components/ActivitiesEvents.astro"], cwd=BASE_DIR)
        sys.exit(1)

    summary_snip = clean_caption[:45] if len(clean_caption) > 45 else clean_caption
    commit_and_push(post_num, summary_snip)

    log("================================================================================")
    log(f"Execution Complete: Post {post_num} successfully published to production.")
    log("================================================================================")


if __name__ == "__main__":
    main()
