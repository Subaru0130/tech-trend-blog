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
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ChoiceGuide",
    default: "ChoiceGuide - 暮らしを豊かにする家電選び",
  },
  description:
    "家電・ガジェット・インテリアの比較レビューをもとに、使い方に合う一台を選びやすくする比較サイトです。",
  metadataBase: new URL("https://choiceguide.jp"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "ChoiceGuide",
    type: "website",
    images: [
      {
        url: "https://choiceguide.jp/images/ogp-default.png",
        width: 1200,
        height: 630,
        alt: "ChoiceGuide - 暮らしを豊かにする家電選び",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://choiceguide.jp/images/ogp-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${manrope.variable} ${notoSansJP.variable}`}
    >
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
              name: "ChoiceGuide",
              url: "https://choiceguide.jp",
              logo: "https://choiceguide.jp/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+81-00-0000-0000",
                contactType: "customer service",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
