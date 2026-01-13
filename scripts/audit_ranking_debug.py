import json
import os

def audit_data():
    base = r"c:\Users\Kokik\OneDrive\gemini\tech-trend-blog"
    prod_path = os.path.join(base, "src", "data", "products.json")
    art_path = os.path.join(base, "src", "data", "articles.json")

    with open(prod_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    with open(art_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    # 1. Map IDs
    prod_ids = {p['id']: p for p in products}
    print(f"Products Found: {len(prod_ids)}")
    
    # 2. Check Under 10k Article
    target_slug = "best-wireless-earphones-under-10000"
    article = next((a for a in articles if a['slug'] == target_slug), None)
    
    if not article:
        print("Article Not Found")
        return

    print(f"\nScanning Article: {article['title']}")
    for item in article['rankingItems']:
        rank = item['rank']
        pid = item['productId']
        print(f"Rank {rank}: {pid}")
        
        if pid not in prod_ids:
            print(f"  -> MISSING in products.json!")
        else:
            p = prod_ids[pid]
            # Check Image
            img = p.get('image')
            local_img = os.path.join(base, "public", img.lstrip('/'))
            if not os.path.exists(local_img):
                 print(f"  -> Image Missing: {local_img}")
            else:
                 size = os.path.getsize(local_img)
                 print(f"  -> Image OK ({size} bytes)")
            
            # Check ASIN
            print(f"  -> ASIN: {p.get('asin')}")

if __name__ == "__main__":
    audit_data()
