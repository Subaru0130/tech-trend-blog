import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: 'ベストバイガイド | 失敗しない「正解」を選ぶ',
    template: '%s | ベストバイガイド',
  },
  description: '専門家と編集部が徹底検証。後悔しない買い物ができる比較検証メディア。',
  verification: {
    google: '767HspWPI5qpvxs1yKvz5otcilg3CdSv_fyZ_9SX0IQ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} ${notoSerifJP.variable} antialiased font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Best Buy Guide',
              url: 'https://tech-trend-blog.vercel.app',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://tech-trend-blog.vercel.app/search?q={search_term_string}',
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
