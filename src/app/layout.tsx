import type { Metadata } from "next";
import "./globals.css";
import { getRepoFiles } from "@/lib/github";
import MainLayout from "@/components/main-layout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Seon | AI-Powered Documentation Platform",
    template: "%s | Seon",
  },
  description:
    "Discover and explore documentation with AI-powered navigation. Seon transforms GitHub repositories into intelligent, searchable knowledge bases with dynamic content generation.",
  keywords: [
    "documentation",
    "AI",
    "markdown",
    "github",
    "knowledge base",
    "content management",
    "artificial intelligence",
    "developer tools",
    "technical documentation",
  ],
  authors: [{ name: "Seon" }],
  creator: "Seon",
  publisher: "Seon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://theseonproject.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Seon | AI-Powered Documentation Platform",
    description:
      "Discover and explore documentation with AI-powered navigation. Transform GitHub repositories into intelligent, searchable knowledge bases.",
    siteName: "Seon",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Seon - AI-Powered Documentation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seon | AI-Powered Documentation Platform",
    description:
      "Discover and explore documentation with AI-powered navigation. Transform GitHub repositories into intelligent knowledge bases.",
    images: ["/og-image.png"],
    creator: "@seon",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const files = await getRepoFiles();

  return (
    <html lang="en" className="dark">
      <head>
        {/* Favicon for browser tab */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Seon",
              description: "AI-Powered Documentation Platform",
              url:
                process.env.NEXT_PUBLIC_BASE_URL ||
                "https://theseonproject.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${
                    process.env.NEXT_PUBLIC_BASE_URL ||
                    "https://theseonproject.com"
                  }/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Seon",
                description:
                  "AI-powered documentation and knowledge management platform",
              },
            }),
          }}
        />
      </head>
      <body className="font-body antialiased">
        <MainLayout files={files}>{children}</MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
