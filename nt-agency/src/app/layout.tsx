import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { HydrationMarker } from "@/components/ui";
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
  title: {
    default: "NT Tech Innovation — Software & AI Agency (Concept)",
    template: "%s | NT Tech Innovation",
  },
  description: "Concept agency website with an AI-assisted lead pipeline.",
  // Concept project: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        {/* Marks that JS is available, so scroll-reveal content may start hidden. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HydrationMarker />
        {children}
        <Toaster theme="dark" richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
