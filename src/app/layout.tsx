import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Manrope, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"], // Noto Sans JP automatically handles Japanese subset via Google Fonts API behavior but 'latin' is usually required argument or preload: false
  preload: false, // Preloading JP fonts can be heavy, usually recommended false or 'latin' only if mixed. Next.js docs say preload: false for subsets not available. Noto Sans JP has subsets. 
  // Let's try standard config:
  variable: "--font-noto-sans-jp",
  display: "swap",
});

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
    <html lang="ja" suppressHydrationWarning className={`${manrope.variable} ${notoSansJP.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className="antialiased font-sans bg-background-light text-text-main"
        suppressHydrationWarning
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EVXJ7G5J76"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EVXJ7G5J76');
          `}
        </Script>
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
