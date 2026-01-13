
import requests

asins = [
    "B0BNNM3W6Q", # EarFun
    "B099933BW3", # Soundcore
    "B0BKA2J4R5", # EarFun alt
    "B09992J2P6", # Soundcore alt
    "B09QW3F6G8"  # Sony LinkBuds? Just testing a known good one
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "https://www.amazon.co.jp/"
}

def check_asins():
    for asin in asins:
        url = f"https://www.amazon.co.jp/dp/{asin}"
        try:
            r = requests.get(url, headers=headers, timeout=5)
            print(f"{asin}: {r.status_code}")
            if r.status_code == 200:
                print(f"  Valid Title found? {'Amazon' in r.text}")
        except Exception as e:
            print(f"{asin}: Error {e}")

if __name__ == "__main__":
    check_asins()
