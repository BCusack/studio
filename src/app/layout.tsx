import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getRepoFiles } from "@/lib/github";
import MainLayout from "@/components/main-layout";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/cookie-consent";
import GA4Reporter from "@/components/ga4-reporter";

export const metadata: Metadata = {
  title: {
    default: "Seon | AI Companions, Zero UI, Future of AI",
    template: "%s | Seon",
  },
  description:
    "Explore AI companions, Zero UI, and the future of human–AI interactions. The Seon is focused on ambient, agentic experiences that make software feel conversational and invisible.",
  keywords: [
    "AI companions",
    "Zero UI",
    "ambient AI",
    "agentic interfaces",
    "conversational UI",
    "AI UX",
    "human–AI interaction",
    "HCI",
    "future of AI",
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
    title: "Seon | AI Companions, Zero UI, Future of AI",
    description:
      "Explore AI companions, Zero UI, and the future of human–AI interactions. The Seon is focused on ambient, agentic experiences that make software feel conversational and invisible.",
    siteName: "Seon",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Seon – AI Companions and Zero UI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seon | AI Companions, Zero UI, Future of AI",
    description:
      "Explore AI companions, Zero UI, and the future of human–AI interactions. The Seon is focused on ambient, agentic experiences that make software feel conversational and invisible.",
    images: ["/og-image.png"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
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
              description:
                "AI companions, Zero UI, and the future of human–AI interfaces.",
              url:
                process.env.NEXT_PUBLIC_BASE_URL ||
                "https://theseonproject.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL ||
                    "https://theseonproject.com"
                    }/?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Seon",
                url:
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://theseonproject.com",
                logo: `${process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://theseonproject.com"
                  }/og-image.png`,
                description:
                  "Exploring AI companions, Zero UI, and ambient agentic experiences.",
              },
            }),
          }}
        />
        {/* Consent Mode v2 - default denied, before any analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} window.gtag = gtag;
                gtag('consent','default',{
                  'analytics_storage':'denied',
                  'ad_storage':'denied',
                  'ad_user_data':'denied',
                  'ad_personalization':'denied'
                });
                try {
                  var id='${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""}';
                  var c=localStorage.getItem('cookie-consent');
                  if (id && c==='accepted') {
                    var s=document.createElement('script');
                    s.async=1; s.src='https://www.googletagmanager.com/gtag/js?id='+id;
                    s.onload=function(){
                      gtag('js', new Date());
                      gtag('config', id, { anonymize_ip: true });
                      gtag('consent','update',{
                        'analytics_storage':'granted',
                        'ad_storage':'granted',
                        'ad_user_data':'granted',
                        'ad_personalization':'granted'
                      });
                    };
                    document.head.appendChild(s);
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <MainLayout files={files}>{children}</MainLayout>
        {/* Cookie consent banner and client-side consent handling */}
        <CookieConsent />
        {/* Report page views on client-side route changes after consent */}
        <Suspense fallback={null}>
          <GA4Reporter />
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
