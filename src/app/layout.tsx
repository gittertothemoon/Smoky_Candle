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
  title: "Smoky Candle | Candele di Soia Artigianali Made in Italy",
  description:
    "Candele artigianali in cera di soia, versate a mano in Italia. Scopri le fragranze Butter e Berry.",
  openGraph: {
    title: "Smoky Candle | Candele di Soia Artigianali",
    description:
      "Candele artigianali in cera di soia, versate a mano in Italia.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
