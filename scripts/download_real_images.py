
import requests
import os

# URLs to download
targets = [
    {
        "url": "https://m.media-amazon.com/images/I/61fICzCda+L._AC_SL1500_.jpg",
        "output": "public/images/products/prod-earfun-air-pro-3.jpg"
    },
    {
        "url": "https://m.media-amazon.com/images/I/61y817A-Q-L._AC_SL1500_.jpg",
        "output": "public/images/products/prod-soundcore-life-p3.jpg"
    },
    {
        "url": "https://m.media-amazon.com/images/I/61vJtKBassL._AC_SL1500_.jpg", # Top 5 thumbnail just in case
        "output": "public/images/thumbnails/ranking_top5_real.jpg"
    }
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.amazon.co.jp/"
}

def download_images():
    for target in targets:
        print(f"Downloading {target['url']}...")
        try:
            response = requests.get(target['url'], headers=headers, timeout=10)
            if response.status_code == 200:
                # Ensure directory
                os.makedirs(os.path.dirname(target['output']), exist_ok=True)
                with open(target['output'], 'wb') as f:
                    f.write(response.content)
                print(f"Success: {target['output']} ({len(response.content)} bytes)")
            else:
                print(f"Failed: {target['url']} Status: {response.status_code}")
        except Exception as e:
            print(f"Error downloading {target['url']}: {e}")

if __name__ == "__main__":
    download_images()
