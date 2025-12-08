async function main() {
    console.log("Fetching Hero Image for: 高級ヘアドライヤー (Stylish/Warm)");
    const imageUrl = await getHeroImage("luxury hair dryer warm interior aesthetic");

    if (imageUrl) {
        console.log("Found URL:", imageUrl);
        const targetPath = path.join(process.cwd(), 'public', 'images', 'hero-dryer.png');
        await download(imageUrl, targetPath);
        console.log("✅ Hero Image Saved to:", targetPath);
    } else {
        console.log("No hero image found.");
    }
}

main();
