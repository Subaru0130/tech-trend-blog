import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://tech-trend-blog-27mo.vercel.app'; // Correct Vercel domain
    const posts = getSortedPostsData();

    const postUrls = posts.map((post) => {
        let date = new Date(post.date);
        if (isNaN(date.getTime())) {
            date = new Date(); // Fallback to current date if invalid
        }
        return {
            url: `${baseUrl}/posts/${post.slug}`,
            lastModified: date,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        };
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postUrls,
    ];
}
