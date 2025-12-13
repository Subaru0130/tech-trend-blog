import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://tech-trend-blog-27mo.vercel.app'),
  title: {
    default: 'ベストバイガイド | 失敗しない「正解」を選ぶ',
    template: '%s | ベストバイガイド',
  },
  description: '専門家と編集部が徹底検証。後悔しない買い物ができる比較検証メディア。',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: '767HspWPI5qpvxs1yKvz5otcilg3CdSv_fyZ_9SX0IQ', // Google Search Console Verification
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content="767HspWPI5qpvxs1yKvz5otcilg3CdSv_fyZ_9SX0IQ" />
        {/* Exact CDN links from original HTML */}
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased font-sans bg-background-light text-text-main"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Best Buy Guide',
              url: 'https://tech-trend-blog-27mo.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://tech-trend-blog-27mo.vercel.app/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
