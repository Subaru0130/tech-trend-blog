import argparse
import requests
from bs4 import BeautifulSoup
import os
import time

# User-Agent to mimic a real browser and avoid blocking
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
}

PRODUCTS = [
    {
        "name": "prod-earfun-air-pro-3.jpg",
        "url": "https://www.amazon.co.jp/dp/B0BNQ611R2"
    },
    {
        "name": "prod-soundpeats-air5-pro.jpg",
        "url": "https://www.amazon.co.jp/dp/B0DWDWL25T"
    },
    {
        "name": "prod-soundcore-life-p3.jpg",
        "url": "https://www.amazon.co.jp/dp/B09539827B"
    }
]

def fetch_og_image(url):
    """
    Fetches the og:image URL from the given page URL using BeautifulSoup.
    """
    try:
        print(f"Fetching page: {url}")
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Strategy 1: Open Graph (Usually 'large' variation on Amazon)
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            img_url = og_image['content']
            print(f"  -> Found og:image: {img_url}")
            return img_url
            
        # Strategy 2: Schema.org (Often inside script type="application/ld+json")
        # (Simplified: Just parsing text for "image": "..." might be risky but standard parsing is better)
        # For now, let's stick to meta tags as they are robust on Amazon.
        
        # Strategy 3: Look for 'landingImage' ID which is common on Amazon Desktop
        img_tag = soup.find('img', id='landingImage')
        if img_tag and img_tag.get('src'):
             img_url = img_tag['src']
             print(f"  -> Found #landingImage: {img_url}")
             return img_url

        print("  -> No image found.")
        return None
        
    except Exception as e:
        print(f"  -> Error fetching page: {e}")
        return None

def download_image(img_url, filename):
    """
    Downloads the image from img_url and saves it to filename.
    """
    try:
        response = requests.get(img_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        output_path = os.path.join(os.getcwd(), 'public', 'images', 'products', filename)
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"  -> Saved to: {output_path}")
        return True
    except Exception as e:
        print(f"  -> Error downloading image: {e}")
        return False

def main():
    print("Starting Amazon Image Fetch (OGP Strategy)...")
    for prod in PRODUCTS:
        print(f"\nProcessing {prod['name']}...")
        img_url = fetch_og_image(prod['url'])
        if img_url:
            download_image(img_url, prod['name'])
            # Sleep to be polite
            time.sleep(2)
        else:
            print("  -> Skipping image download.")

if __name__ == "__main__":
    main()
