
import json
import requests
import os
import re
import shutil

JSON_PATH = 'src/data/products.json'
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "https://www.google.com/"
}

def download_image_from_search(term, output_path):
    print(f"  [Img] Searching strict image for: {term}")
    url = f"https://www.amazon.co.jp/s?k={term.replace(' ', '+')}"
    
    # Critical keywords that MUST be in the title (Case-insensitive)
    # e.g. "Sony WF-C500" -> ["sony", "wf-c500"]
    required_keywords = [k.lower() for k in term.split() if len(k) > 1]
    
    # Negative keywords to avoid accessories
    negative_keywords = ['case', 'cover', 'skin', 'protective', 'film', 'tip', 'piece', 'bud', 'hook',
                        'ケース', 'カバー', '保護', 'フィルム', 'チップ', 'ピース', 'イヤーピース', 'イヤーチップ']

    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            # Simple heuristic parsing: Split by search result blocks
            results = r.text.split('data-component-type="s-search-result"')
            
            for res_block in results[1:]: # Skip preamble
                # Extract Title
                # Flexible Regex
                title_match = re.search(r'a-text-normal[^>]*>([^<]+)</span>', res_block)
                if not title_match:
                     # Try H2 fallback
                     title_match = re.search(r'<h2[^>]*>.*?<span[^>]*>([^<]+)</span>', res_block, re.DOTALL)
                
                if not title_match:
                    continue
                
                title = title_match.group(1).lower()
                
                # check negative
                if any(neg in title for neg in negative_keywords):
                    print(f"    [Skip] Found accessory: {title[:30]}...")
                    continue
                
                # check positive
                # Improved Logic:
                # 1. Separate keywords into Model Number Candidates (alphanumeric mixed) and others.
                # 2. Model Numbers are STRICTLY REQUIRED.
                # 3. If no Model Number, then ALL other keywords are required.
                
                model_numbers = [w for w in required_keywords if re.search(r'[a-zA-Z]', w) and re.search(r'[0-9]', w)]
                other_keywords = [w for w in required_keywords if w not in model_numbers]
                
                if model_numbers:
                    # Case 1: Model Number exists (e.g. WF-C500)
                    # Use minimal strictness suitable for JP titles
                    # Only the Model Number is strictly required. Brand name "Sony" might be "ソニー".
                    if any(mn not in title for mn in model_numbers):
                         print(f"    [Skip] Missing Model ID: {title[:30]}... (Wanted {model_numbers})")
                         continue
                else:
                    # Case 2: Broad Search (e.g. "Wireless Earphones")
                    # Require substantial overlap
                    matches = sum(1 for w in required_keywords if w in title)
                    if matches < len(required_keywords):
                        print(f"    [Skip] Simple mismatch: {title[:30]}...")
                        continue

                # Extract Image
                img_match = re.search(r'src="(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', res_block)
                if img_match:
                    target_url = img_match.group(1)
                    
                    # Upgrade to High Res
                    file_id_match = re.search(r'/images/I/([^.]+)\.', target_url)
                    if file_id_match:
                         target_url = f"https://m.media-amazon.com/images/I/{file_id_match.group(1)}.jpg"
                    
                    print(f"  [Img] Found Match: {target_url} (Title: {title[:50]}...)")
                    
                    try:
                        img_data = requests.get(target_url, headers=HEADERS, timeout=10).content
                        if len(img_data) > 1000:
                            os.makedirs(os.path.dirname(output_path), exist_ok=True)
                            with open(output_path, 'wb') as f:
                                f.write(img_data)
                            print(f"  [Img] Saved to {output_path}")
                            return True
                    except:
                        continue
                        
        return False

    except Exception as e:
        print(f"  [Img] Error: {e}")
        return False

def audit():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)

    modified = False

    for p in products:
        print(f"Checking: {p['name']} ({p['id']})")
        
        # 1. Check ASIN
        if 'asin' in p and p['asin']:
            asin = p['asin']
            url = f"https://www.amazon.co.jp/dp/{asin}"
            try:
                r = requests.get(url, headers=HEADERS, timeout=5)
                # Check for 404 or "Page Not Found" text in Japanese
                is_dead = r.status_code == 404 or "ページが見つかりません" in r.text
                
                if is_dead:
                    print(f"  [Link] ASIN {asin} is DEAD. Removing...")
                    del p['asin'] # Remove bad ASIN
                    # Force Search Link
                    if 'amazon' not in p['affiliateLinks'] or not p['affiliateLinks']['amazon']:
                        p['affiliateLinks']['amazon'] = f"https://www.amazon.co.jp/s?k={p['name'].replace(' ', '+')}"
                        modified = True
                else:
                    print(f"  [Link] ASIN {asin} is ALIVE.")
                    # Ensure regular link exists
                    if 'amazon' not in p['affiliateLinks'] or not p['affiliateLinks']['amazon']:
                         p['affiliateLinks']['amazon'] = f"https://www.amazon.co.jp/dp/{asin}"
                         modified = True
            except:
                print(f"  [Link] Failed to check {asin}. Assuming dead for safety.")
                del p['asin']
                if 'amazon' not in p['affiliateLinks'] or not p['affiliateLinks']['amazon']:
                    p['affiliateLinks']['amazon'] = f"https://www.amazon.co.jp/s?k={p['name'].replace(' ', '+')}"
                    modified = True
        else:
             # No ASIN - Generate Search Link
             if 'amazon' not in p.get('affiliateLinks', {}) or not p['affiliateLinks'].get('amazon'):
                  # Initialize dict if needed
                  if 'affiliateLinks' not in p: p['affiliateLinks'] = {}
                  p['affiliateLinks']['amazon'] = f"https://www.amazon.co.jp/s?k={p['name'].replace(' ', '+')}"
                  print(f"  [Link] Generated Search Link for {p['name']}")
                  modified = True

        # 2. Check Image
        img_path = p.get('image', '')
        should_download = False
        
        if not img_path:
             print(f"  [Img] Image path is empty.")
             should_download = True
        elif img_path.startswith('/'):
            # Local file
            local_full_path = os.path.join(os.getcwd(), 'public', img_path.lstrip('/'))
            if not os.path.exists(local_full_path) or os.path.getsize(local_full_path) < 100:
                print(f"  [Img] Local file missing/empty: {local_full_path}")
                should_download = True
        elif img_path.startswith('http') and 'placehold' in img_path:
             print(f"  [Img] Placeholder detected.")
             should_download = True
        
        # Sony WF-C500 specific fix requested by user ("Image looks wrong")
        if p['id'] == 'sony-wf-c500':
             print(f"  [Img] User requested refresh for Sony WF-C500.")
             should_download = True

        if should_download:
            new_filename = f"prod-{p['id']}.jpg"
            new_local_path = f"/images/products/{new_filename}"
            full_out_path = os.path.join(os.getcwd(), 'public', 'images', 'products', new_filename)
            
            if download_image_from_search(p['name'], full_out_path):
                p['image'] = new_local_path
                modified = True

    if modified:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=4, ensure_ascii=False)
        print("Updated products.json")
    else:
        print("No changes needed.")

if __name__ == "__main__":
    audit()
