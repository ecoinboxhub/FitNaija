import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitNaija — AI-Powered Fitness Challenges in Abuja",
  description: "Abuja's premium fitness accountability platform. AI coach, photo verification, community challenges, and smart leaderboards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitNaija",
  },
  openGraph: {
    title: "FitNaija — AI-Powered Fitness Challenges",
    description: "Transform your fitness journey with AI coaching and community accountability in Abuja.",
    type: "website",
    siteName: "FitNaija",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
