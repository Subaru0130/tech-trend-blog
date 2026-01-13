---
description: How to add new products to rankings with strict Amazon verification
---

# Amazon Product Ranking Onboarding Protocol

To ensure data integrity and avoid broken links or missing images, follow this strict 3-step process when adding new products.

## 1. Verify Existence on Amazon.co.jp
- Search for the product on [Amazon.co.jp](https://www.amazon.co.jp).
- Identify the correct **ASIN** (e.g., `B0xxxx`) from the URL or product details.
- Ensure the product is in stock and matches the specific color/model.

## 2. Acquire Official Image
- **DO NOT** use AI generation.
- **DO NOT** use random Google Images.
- Use the stable Amazon Image API pattern:
  ```
  http://images.amazon.com/images/P/[ASIN].01._SCLZZZZZZZ_.jpg
  ```
- Download this image to `public/images/products/prod-[id].jpg` using `curl`.

## 3. Update Product Data (products.json)
- Set `asin` to the verified ID.
- Set `affiliateLinks.amazon` to the direct DP link:
  ```json
  "affiliateLinks": {
      "amazon": "https://www.amazon.co.jp/dp/[ASIN]"
  }
  ```
- This ensures that if the link logic changes (e.g., tag injection), the base is always the correct product page.
