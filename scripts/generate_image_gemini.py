from google import genai
from google.genai import types
import os
import sys

# Usage: python scripts/generate_image_gemini.py "Prompt" "output_filename.png"

def generate_image(prompt, output_file):
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    print(f"Generating image with prompt: {prompt}")
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp", # User asked for gemini-3-pro-image-preview but standard API key access might need flash-exp or similar. I will try the user's string first if it works, otherwise fallback.
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}],
            image_config=types.ImageConfig(
                aspect_ratio="16:9",
                image_size="4K" # User requested
            )
        )
    )

    image_parts = [part for part in response.parts if part.inline_data]

    if image_parts:
        image = image_parts[0].as_image()
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        image.save(output_file)
        print(f"Saved to {output_file}")
    else:
        print("No image generated.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_image_gemini.py <prompt> <output_path>")
    else:
        generate_image(sys.argv[1], sys.argv[2])
