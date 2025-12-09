import { getSortedPostsData } from '../src/lib/posts.ts';

try {
    const posts = getSortedPostsData();
    console.log("--- Debugging Posts Data ---");
    posts.forEach((post, i) => {
        console.log(`[Post ${i}] Slug: ${post.slug}`);
        console.log(`  Title: "${post.title}" (Type: ${typeof post.title})`);
        console.log(`  Date: "${post.date}"`);
        console.log(`  Image: "${post.image}"`);
        console.log(`  Description length: ${post.description?.length}`);
    });
} catch (error) {
    console.error("Error reading posts:", error);
}
