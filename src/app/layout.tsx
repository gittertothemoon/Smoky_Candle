import type { Metadata } from "next";
import { Young_Serif, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  subsets: ["latin"],
  weight: "400",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smokycandle.com"),
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
    url: "https://smokycandle.com",
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
    canonical: "https://smokycandle.com",
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  // Safari su iPhone trasforma da solo numeri, email e indirizzi in link: il testo cambia
  // prima che React si agganci e la pagina va in errore di idratazione
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${youngSerif.variable} ${hanken.variable} antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#fragranze"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-fuliggine focus:px-4 focus:py-2 focus:text-sm focus:text-carta"
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
              url: "https://smokycandle.com",
              logo: "https://smokycandle.com/images/logo.webp",
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
