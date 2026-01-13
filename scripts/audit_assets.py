import os
import urllib.request
import urllib.error
import struct

def check_link(asin):
    url = f"https://www.amazon.co.jp/dp/{asin}?tag=demo-22"
    print(f"Checking Link: {url}")
    try:
        # User-Agent is crucial
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req) as response:
            print(f"  -> Status: {response.status}")
            print(f"  -> Final URL: {response.geturl()}")
    except urllib.error.HTTPError as e:
        print(f"  -> HTTP Error: {e.code} {e.reason}")
    except Exception as e:
        print(f"  -> Error: {e}")

def check_image(path):
    print(f"Checking Image: {path}")
    if not os.path.exists(path):
        print("  -> File Missing!")
        return
    
    size = os.path.getsize(path)
    print(f"  -> Size: {size} bytes")
    
    with open(path, 'rb') as f:
        head = f.read(10)
        print(f"  -> Header: {head.hex().upper()}")
        
        # JPEG Magic Number: FF D8 FF
        if head.startswith(b'\xFF\xD8\xFF'):
            print("  -> Format: Valid JPEG")
        elif head.startswith(b'\x89PNG'):
            print("  -> Format: Valid PNG")
        elif b'<html' in head.lower() or b'<!doc' in head.lower():
            print("  -> Format: INVALID (HTML detected)")
        else:
            print("  -> Format: Unknown/Corrupt")

# 1. Check Links
check_link("B097R2M736") # Life P3 (Reported broken)
check_link("B0C1NJYBP3") # EarFun (Rank 1)
check_link("B0CJBZ9XFP") # SoundPEATS (Rank 5)

# 2. Check Images
base = r"c:\Users\Kokik\OneDrive\gemini\tech-trend-blog\public\images\products"
check_image(os.path.join(base, "prod-soundcore-life-p3.jpg"))
check_image(os.path.join(base, "prod-earfun-air-pro-3.jpg")) # Rank 1
check_image(os.path.join(base, "prod-soundpeats-air4-pro.jpg")) # Rank 5
