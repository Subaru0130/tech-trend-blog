// Main
async function main() {
    // 1. Water Purifier
    console.log("Downloading High-Res Water Purifier Image...");
    // Verified High-Res Unsplash Image (Modern Kitchen/Water)
    await download("https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2670&auto=format&fit=crop", "hero-water.png");

    // 2. Hair Dryer
    console.log("Downloading High-Res Hair Dryer Image...");
    // Verified High-Res Unsplash Image (Beauty/Salon/Hair)
    await download("https://images.unsplash.com/photo-1522337360705-8754d3d700e8?q=80&w=2670&auto=format&fit=crop", "hero-dryer.png");

    console.log("✅ High-Resolution Hero Images Updated (Unsplash)");
}

main();
