import type { Metadata } from "next";
import { Geist, Geist_Mono, Mulish, Space_Grotesk, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
// import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

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

const mulish = Mulish({ 
  subsets: ["latin"],
  variable: "--font-mulish",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
  title: "Arca",
  description: "Arca Payment Protocol",
};

import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(ibmPlexMono.variable)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable} antialiased`}
        // className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} ${spaceGrotesk.variable} ${cormorantGaramond.variable} ${sohne.variable} ${canela.variable} antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
        <Providers>
          {children}
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
