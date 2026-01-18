
import { verifyProducts } from './verify_products_old.mjs';

async function testOldLogic() {
    console.log("🕰️ Testing Old Logic (Yahoo -> Amazon verification)...");

    // Test with a known product
    const testProducts = ["Apple AirPods Pro (第2世代)"];

    const results = await verifyProducts(testProducts);

    console.log("\n📊 Results:");
    console.log(JSON.stringify(results, null, 2));
}

testOldLogic();
