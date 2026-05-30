import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";

/* ── Uncomment these local font configurations once the licensed font files are uploaded to `/public/fonts/` ──
const sohne = localFont({
  src: [
    { path: "../public/fonts/Sohne-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Sohne-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Sohne-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans-override",
  display: 'swap',
});

const canela = localFont({
  src: [
    { path: "../public/fonts/Canela-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Canela-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Canela-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-serif-override",
  display: 'swap',
});
*/

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mecha Pay — Protocol Gating Portal",
  description: "Secure and instant blockchain-gated subscription platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
      // className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} ${sohne.variable} ${canela.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
