
import requests
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

def check():
    term = "Sony WF-C500"
    url = f"https://www.amazon.co.jp/s?k={term.replace(' ', '+')}"
    print(f"Searching: {url}")
    
    r = requests.get(url, headers=HEADERS)
    results = r.text.split('data-component-type="s-search-result"')
    
    required_keywords = ["sony", "wf-c500"]
    negative_keywords = ['case', 'cover', 'skin', 'protective', 'film', 'ケース', 'カバー', '保護', 'フィルム']

    print(f"Found {len(results)-1} results.")
    
    for i, res_block in enumerate(results[1:]):
        # Flexible Regex
        title_match = re.search(r'a-text-normal[^>]*>([^<]+)</span>', res_block)
        if not title_match:
            # Try H2
            title_match = re.search(r'<h2[^>]*>.*?<span[^>]*>([^<]+)</span>', res_block, re.DOTALL)
        
        if not title_match:
            if i < 3: print(f"[{i}] No title found. Block: {res_block[:100]}...")
            continue

        title = title_match.group(1).lower()
        
        print(f"[{i}] {title[:60]}...")
        
        # Check Negative
        if any(neg in title for neg in negative_keywords):
             print(f"   -> REJECTED (Negative Keyword)")
             continue
             
        # Check Positive
        missing = [w for w in required_keywords if w not in title]
        if missing:
             print(f"   -> REJECTED (Missing: {missing})")
             continue
             
        print(f"   -> ACCEPTED!")
        
        # Check Image
        img_match = re.search(r'src="(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', res_block)
        if img_match:
            print(f"   -> Image: {img_match.group(1)}")
            
if __name__ == "__main__":
    check()
