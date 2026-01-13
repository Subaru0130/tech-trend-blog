import json
import os
import sys

def check_products():
    base_path = r"c:\Users\Kokik\OneDrive\gemini\tech-trend-blog"
    products_path = os.path.join(base_path, "src", "data", "products.json")
    
    try:
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
    except Exception as e:
        print(f"Error loading products.json: {e}")
        return

    print(f"Scanning {len(products)} products...")
    
    missing_images = []
    duplicate_asins = {}
    link_mismatches = []
    
    asins_seen = {}

    for p in products:
        pid = p.get('id')
        name = p.get('name')
        image_rel = p.get('image')
        asin = p.get('asin')
        aff_amazon = p.get('affiliateLinks', {}).get('amazon', '')

        # 1. Check Image
        if image_rel:
            # remove leading slash
            img_path = os.path.join(base_path, "public", image_rel.lstrip('/'))
            if not os.path.exists(img_path):
                missing_images.append(f"{pid} ({name}): {image_rel}")
        
        # 2. Check ASIN Duplicates
        if asin:
            if asin in asins_seen:
                duplicate_asins[asin] = duplicate_asins.get(asin, [asins_seen[asin]])
                duplicate_asins[asin].append(pid)
            else:
                asins_seen[asin] = pid
        
        # 3. Check Link Consistency
        if asin and aff_amazon:
            if asin not in aff_amazon and "s?k=" not in aff_amazon:
                 # It's okay if it's a search link, but if it looks like a direct link it should contain the ASIN
                 link_mismatches.append(f"{pid}: ASIN {asin} vs Link {aff_amazon}")

    print("\n--- MISSING IMAGES ---")
    if missing_images:
        for m in missing_images:
            print(m)
    else:
        print("None")

    print("\n--- DUPLICATE ASINS ---")
    if duplicate_asins:
        for k, v in duplicate_asins.items():
            print(f"ASIN {k}: {v}")
    else:
        print("None")

    print("\n--- LINK MISMATCHES ---")
    if link_mismatches:
        for m in link_mismatches:
            print(m)
    else:
        print("None")

if __name__ == "__main__":
    check_products()
