import os
import json
import argparse
import google.generativeai as genai
from typing import Optional
from dotenv import load_dotenv

load_dotenv('.env.local')

# Configuration
DATA_PATH = os.path.join("src", "data", "products.json")
OUTPUT_DIR = os.path.join("src", "content", "reviews")

# System Prompt (Approved by User)
SYSTEM_PROMPT = """
Role: You are a veteran audio gadget reviewer (15 years experience). You have purchased and tested over 5,000 earphones. You hate generic marketing fluff. You value "honesty" and "user experience" above all.

Tone: Professional but conversational. Like a knowledgeable friend advising a hesitant buyer. Slightly critical. Use short sentences.

Task: Write a detailed review for the provided product based on its specs.

Guidelines:
1.  **NO Generic Praise**: Don't say "crystal clear highs" or "immersive bass" without qualifying it (e.g., "The bass kicks like a mule, but muddies the mids in rock tracks").
2.  **Simulate Real Life**: Describe using it in a packed train, a windy street, or a quiet library. How does the ANC *actually* feel? (e.g. "It cuts out engine drone, but voices still leak through").
3.  **Comparisons**: Compare it to major rivals (AirPods Pro 2, Sony WF-1000XM5) even if they aren't in the input data. Use your internal knowledge.
4.  **Formatting**: Use Markdown H2/H3.
5.  **Language**: Japanese (Natural, fluent, targeting Japanese consumers).

Structure:
-   **The "Real" Verdict** (結論): Start with the conclusion. Buy it or skip it?
-   **Sound Quality** (音質): Detailed frequency analysis (Low/Mid/High).
-   **ANC & Fit** (ノイキャン・装着感): Practical noise cancelling test.
-   **The "Bad" Parts** (ここが残念): Dedicate a section to things that annoy you (Case size, app lag, etc.).
-   **Final Rating**: 0-5 stars with justification.
"""

def load_products():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_product(products, slug):
    for p in products:
        if p['id'] == slug:
            return p
    return None

def generate_review(product, api_key, model_name="gemini-1.5-pro-latest"):
    genai.configure(api_key=api_key)
    
    # Note: gemini-3-pro-preview might utilize a specific beta endpoint or name.
    # Fallback to 1.5 Pro if 3 is not yet publicly accessible via this lib standardly, 
    # but allowing user to override via args or env.
    
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=SYSTEM_PROMPT
    )

    user_message = f"""
    Product Name: {product['name']}
    Price: {product['price']}
    Specs:
    {json.dumps(product['specs'], indent=2, ensure_ascii=False)}
    
    Pros: {', '.join(product['pros'])}
    Cons: {', '.join(product['cons'])}
    """

    response = model.generate_content(user_message)
    return response.text

def main():
    parser = argparse.ArgumentParser(description='Generate review using Gemini API')
    parser.add_argument('--slug', required=True, help='Product slug (ID)')
    # STRICTLY enforcing gemini-3-pro-preview as per user mandate
    parser.add_argument('--model', default='gemini-3-pro-preview', help='Model name')
    args = parser.parse_args()

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY environment variable not set.")
        return

    products = load_products()
    product = get_product(products, args.slug)
    
    if not product:
        print(f"Error: Product with slug '{args.slug}' not found.")
        return

    print(f"Generating review for {product['name']} using {args.model}...")
    
    try:
        review_content = generate_review(product, api_key, args.model)
        
        output_path = os.path.join(OUTPUT_DIR, f"{args.slug}.md")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(review_content)
            
        print(f"Success! Review saved to {output_path}")
        
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to generate with {args.model}.")
        print(f"Error details: {e}")
        print("Please ensure your API key has access to 'gemini-3-pro-preview'.")

if __name__ == "__main__":
    main()
