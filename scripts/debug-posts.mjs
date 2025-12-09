import { getSortedPostsData } from '../src/lib/posts.ts'; // This import might fail in pure Node if ts-node isn't registered. 
// Wait, I can't import .ts in .mjs without loader.
// I'll just read the files directly in this script to simulate what the app does.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

console.log("--- Debugging Posts Data ---");
try {
    if (!fs.existsSync(postsDirectory)) {
        console.log("Directory not found");
    } else {
        const fileNames = fs.readdirSync(postsDirectory);
        fileNames.filter(f => f.endsWith('.mdx')).forEach(fileName => {
            console.log(`\nFile: ${fileName}`);
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            console.log(`  Title: "${matterResult.data.title}"`);
            console.log(`  Date: "${matterResult.data.date}"`);
            console.log(`  Image: "${matterResult.data.image}"`);
        });
    }
} catch (e) {
    console.error(e);
}
