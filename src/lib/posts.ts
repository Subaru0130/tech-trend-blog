import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags?: string[];
    content: string;
    image?: string;
}

export function getSortedPostsData(): PostData[] {
    // Create directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter(fileName => fileName.endsWith('.mdx'))
        .map((fileName) => {
            // Remove ".mdx" from file name to get slug
            const slug = fileName.replace(/\.mdx$/, '');

            // Read markdown file as string
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const matterResult = matter(fileContents);

            const data = matterResult.data as { title: string; date: string | Date; description: string; tags: string[]; image?: string };
            // Ensure date is a string to avoid React serialization errors
            const dateStr = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;

            // Combine the data with the slug
            return {
                slug,
                content: matterResult.content,
                ...data,
                date: dateStr,
                image: data.image,
            };
        });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getPostData(slug: string): PostData {
    const decodedSlug = decodeURIComponent(slug);
    const fullPath = path.join(postsDirectory, `${decodedSlug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const data = matterResult.data as { title: string; date: string | Date; description: string; tags: string[]; image?: string };
    const dateStr = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;

    return {
        slug,
        content: matterResult.content,
        ...data,
        date: dateStr,
        image: data.image,
    };
}
