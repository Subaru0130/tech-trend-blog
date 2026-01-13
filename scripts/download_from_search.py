
import requests
import re
import os

queries = [
    {
        "term": "EarFun Air Pro 3",
        "output": "public/images/products/prod-earfun-air-pro-3.jpg"
    },
    {
        "term": "Anker Soundcore Life P3",
        "output": "public/images/products/prod-soundcore-life-p3.jpg"
    }
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "https://www.google.com/"
}

def run():
    for q in queries:
        url = f"https://www.amazon.co.jp/s?k={q['term'].replace(' ', '+')}"
        print(f"Searching {url}...")
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200:
                # Find first image in s-image class or similar
                # Simple regex for m.media-amazon images
                # usually src="https://m.media-amazon.com/images/I/..."
                
                # Look for typical product image pattern
                matches = re.findall(r'src="(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', r.text)
                
                # Filter out tiny pixel trackers or sprites if needed, but usually Search returns valid item images first
                valid_img = None
                for m in matches:
                    if '.jpg' in m:
                        valid_img = m
                        break
                
                if valid_img:
                    # Upgrade to High Res
                    # Convert .../I/ID._AC_SR160...jpg to .../I/ID.jpg
                    # Pattern: /images/I/([A-Za-z0-9\+\-]+)\.
                    file_id_match = re.search(r'/images/I/([^.]+)\.', valid_img)
                    if file_id_match:
                        file_id = file_id_match.group(1)
                        high_res_url = f"https://m.media-amazon.com/images/I/{file_id}.jpg"
                        print(f"Found Image: {valid_img}")
                        print(f"Upgrading to High Res: {high_res_url}")
                        
                        try:
                            img_data = requests.get(high_res_url, headers=headers).content
                        except:
                            # Fallback if High Res fails (unlikely)
                            img_data = requests.get(valid_img, headers=headers).content

                        os.makedirs(os.path.dirname(q['output']), exist_ok=True)
                        with open(q['output'], 'wb') as f:
                            f.write(img_data)
                        print(f"Saved High Res to {q['output']}")
                    else:
                        print("Could not parse Image ID.")
                else:
                    print("No image pattern found in HTML.")
            else:
                print(f"Search Page Failed: {r.status_code}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run()
