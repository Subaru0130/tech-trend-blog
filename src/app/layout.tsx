import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | ChoiceGuide",
    default: "ChoiceGuide - 暮らしを豊かにする家電選び",
  },
  description: "専門家が厳選した家電・日用品のおすすめランキング。冷蔵庫、洗濯機から最新ガジェットまで、失敗しない買い物ガイド。",
  metadataBase: new URL('https://choiceguide.jp'),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: 'ChoiceGuide',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className="antialiased font-sans bg-background-light text-text-main"
        suppressHydrationWarning
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ChoiceGuide",
              "url": "https://choiceguide.jp",
              "logo": "https://choiceguide.jp/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+81-00-0000-0000",
                "contactType": "customer service"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
