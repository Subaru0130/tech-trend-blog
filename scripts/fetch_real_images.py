import urllib.request
import os

def download_image(url, path):
    print(f"Downloading {url} to {path}")
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]
    urllib.request.install_opener(opener)
    try:
        urllib.request.urlretrieve(url, path)
        size = os.path.getsize(path)
        print(f"Success! Size: {size} bytes")
        if size < 2000:
             print("WARNING: File too small, likely blocked or empty.")
    except Exception as e:
        print(f"Error: {e}")

base_dir = r"c:\Users\Kokik\OneDrive\gemini\tech-trend-blog\public\images\products"

# SoundPEATS Air4 Pro
download_image(
    "http://images.amazon.com/images/P/B0CJBZ9XFP.01._SCLZZZZZZZ_.jpg",
    os.path.join(base_dir, "prod-soundpeats-air4-pro.jpg")
)

# EarFun Air Pro 3 (Just in case)
download_image(
    "http://images.amazon.com/images/P/B0C1NJYBP3.01._SCLZZZZZZZ_.jpg",
    os.path.join(base_dir, "prod-earfun-air-pro-3.jpg")
)
