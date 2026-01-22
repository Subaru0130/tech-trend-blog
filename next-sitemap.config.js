/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://choiceguide.jp',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    outDir: 'out', // output directory for static export
}
