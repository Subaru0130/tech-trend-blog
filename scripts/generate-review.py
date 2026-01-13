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
Role: You are a helpful tech blog editor. You analyze product specifications and user reputation to write useful summaries.

Tone: Polite and professional (Desu/Masu form). Objective but helpful. Do NOT use a fake persona. Do NOT use bold text (**) within sentences for emphasis. Write plain, natural text.

Task: Write a detailed review article for the provided product based on its specs, pros, and cons.

Guidelines:
1.  **Based on Facts**: Write based ONLY on the provided specs, pros, and cons.
2.  **No Bolding**: Do not bold key phrases in paragraphs.
3.  **Specific Details**: Explain "how" the sound is satisfying.
4.  **Comparisons**: Compare with rivets based on general market knowledge.
5.  **Formatting**: Use Markdown H2/H3 for headers only.
6.  **Language**: Japanese (Natural, polite, fluent).

Structure:
-   **Conclusion** (結論): Should I buy it?
-   **Sound Quality** (音質): Detailed analysis.
-   **ANC & Fit** (ノイキャン・装着感): Practical test results.
-   **Cons** (気になった点): Honest but polite criticism.
-   **Rating**: 0-5 stars with justification.
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
    parser.add_argument('--slug',  help='Product slug (ID). If not provided, generates for ALL products.')
    parser.add_argument('--model', default='gemini-3-pro-preview', help='Model name')
    args = parser.parse_args()

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY environment variable not set.")
        return

    products = load_products()
    
    # If slug provided, list containing only that product. Else all products.
    target_products = []
    if args.slug:
        p = get_product(products, args.slug)
        if p:
            target_products.append(p)
        else:
            print(f"Error: Product with slug '{args.slug}' not found.")
            return
    else:
        target_products = products

    print(f"Generating reviews for {len(target_products)} products using {args.model}...")

    for product in target_products:
        print(f"Processing: {product['name']} ({product['id']})...")
        try:
            review_content = generate_review(product, api_key, args.model)
            
            # FORCE REMOVE AI-LIKE BOLDING as requested by user
            review_content = review_content.replace('**', '')
            
            output_path = os.path.join(OUTPUT_DIR, f"{product['id']}.md")
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(review_content)
                
            print(f"  -> Saved to {output_path}")
            
        except Exception as e:
            print(f"  -> ERROR: Failed to generate {product['id']}: {e}")


if __name__ == "__main__":
    main()
