import sys
import os

filepath = 'src/data/articles.json'

try:
    # Read as UTF-8-SIG to handle BOM and getting the "garbled" string as Python string
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    print(f"Read {len(content)} characters. First 20: {repr(content[:20])}")

    # The content was likely Shift-JIS bytes interpreted as UTF-8, then saved as UTF-8.
    # To reverse:
    # 1. content (str) is the mojibake.
    # 2. Encode to 'cp932' (Shift-JIS) to recover the original raw bytes.
    # 3. Decode those raw bytes as 'utf-8' to get the actual text.
    
    raw_bytes = content.encode('cp932')
    fixed_text = raw_bytes.decode('utf-8')

    print(f"Fixed content preview: {fixed_text[:100]}")

    # Write back as clean UTF-8 (no BOM)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_text)

    print("SUCCESS: File fixed and saved.")

except UnicodeEncodeError as e:
    print(f"FAILURE during encode (Mojibake might be irreversible or mixed): {e}")
except UnicodeDecodeError as e:
    print(f"FAILURE during decode (Recoved bytes are not valid UTF-8): {e}")
except Exception as e:
    print(f"FAILURE: {e}")
