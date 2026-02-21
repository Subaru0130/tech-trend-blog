/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://choiceguide.jp',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    outDir: 'out',
    exclude: ['/link/*', '/search', '/search/'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/favicon.ico', '/_next/static/'],
            },
        ],
    },
}
