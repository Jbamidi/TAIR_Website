import type { Metadata } from "next";
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
  title: "TAIR — Autonomous indoor intelligence",
  description:
    "Autonomous drones map your warehouse every night. Your WMS wakes up corrected. TAIR is the indoor intelligence platform for cold chain, pharma, and 3PL warehouses.",
  keywords: [
    "warehouse automation",
    "inventory accuracy",
    "autonomous drone",
    "LiDAR SLAM",
    "RFID",
    "digital twin",
    "cold chain",
    "WMS integration",
  ],
  openGraph: {
    title: "TAIR — Autonomous indoor intelligence",
    description:
      "Autonomous drones map your warehouse every night. Your WMS wakes up corrected.",
    url: "https://tairsystems.com",
    siteName: "TAIR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
