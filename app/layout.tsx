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
  title: "VOXLY - AI Voiceovers for Instagram Reels | Professional Voice Generation",
  description: "Generate studio-quality AI voiceovers for your Instagram Reels in 10 seconds. Support for Hindi, Hinglish, English & 12+ languages. No mic needed.",
  keywords: "voiceover, AI voice, Instagram reels, voiceover generator, text to speech, Hindi voiceover, Hinglish voiceover",
  metadataBase: new URL("https://voxly.ai"),
  openGraph: {
    title: "VOXLY - Professional AI Voiceovers for Reels",
    description: "Generate viral-ready voiceovers in 10 seconds. No recording gear needed.",
    url: "https://voxly.ai",
    siteName: "VOXLY",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VOXLY - AI Voiceover Generator",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOXLY - AI Voiceovers for Reels",
    description: "Generate viral-ready voiceovers in 10 seconds",
    images: ["/og-image.jpg"],
    creator: "@voxlyai",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  alternates: {
    canonical: "https://voxly.ai",
  },
  authors: [{ name: "VOXLY", url: "https://voxly.ai" }],
  creator: "VOXLY",
  publisher: "VOXLY",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Additional Meta Tags for SEO */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-title" content="VOXLY" />
        <meta name="theme-color" content="#ec4899" />

        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "VOXLY",
              url: "https://voxly.ai",
              description: "Professional AI voiceover generator for Instagram Reels",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                email: "support@voxly.ai",
              },
            }),
          }}
        />

        {/* JSON-LD SoftwareApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "VOXLY",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              description: "AI-powered voiceover generator for Instagram Reels content creators",
              url: "https://voxly.ai",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
