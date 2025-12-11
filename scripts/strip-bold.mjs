import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content/posts');

if (!fs.existsSync(postsDir)) {
    console.error(`Directory not found: ${postsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(postsDir);

files.forEach(file => {
    if (path.extname(file) === '.mdx') {
        const filePath = path.join(postsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        if (content.includes('**')) {
            console.log(`Stripping bolding from: ${file}`);
            // Replace **text** with text (remove the ** markers)
            content = content.replace(/\*\*/g, '');
            fs.writeFileSync(filePath, content, 'utf-8');
        } else {
            console.log(`No bolding found in: ${file}`);
        }
    }
});

console.log('Bold stripping complete.');
