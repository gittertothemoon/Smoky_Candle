import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smoky-candle.vercel.app"),
  title: "Smoky Candle — Candele in cera di soia, colate a mano in Italia",
  description:
    "Due fragranze, una cosa fatta bene. Cera di soia 100%, niente ftalati, vetro da riusare. Butter e Berry, colate a mano in Italia.",
  keywords: ["candele cera di soia", "candele artigianali italia", "candele profumate naturali", "candele soia made in italy"],
  authors: [{ name: "Smoky Candle" }],
  openGraph: {
    title: "Smoky Candle — Candele in cera di soia",
    description:
      "Due fragranze. Cera di soia 100%. Colate a mano in Italia.",
    type: "website",
    locale: "it_IT",
    url: "https://smoky-candle.vercel.app",
    siteName: "Smoky Candle",
    images: [
      {
        url: "/images/hero_7.webp",
        width: 1366,
        height: 768,
        alt: "Candela Smoky Candle in cera di soia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smoky Candle — Candele in cera di soia",
    description: "Due fragranze. Colate a mano in Italia.",
    images: ["/images/hero_7.webp"],
  },
  alternates: {
    canonical: "https://smoky-candle.vercel.app",
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <a
          href="#fragranze"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900"
        >
          Vai al contenuto principale
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Smoky Candle",
              url: "https://smoky-candle.vercel.app",
              logo: "https://smoky-candle.vercel.app/images/logo.webp",
              description: "Candele in cera di soia colate a mano in Italia.",
              sameAs: ["https://instagram.com/smokycandle"],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@smokycandle.it",
                contactType: "customer service",
                areaServed: "IT",
                availableLanguage: "Italian",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
