import type { Metadata } from 'next';
import './globals.css';
import { getRepoFiles } from '@/lib/github';
import MainLayout from '@/components/main-layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Seon Explorer',
  description: 'Explore Markdown files from GitHub with an AI-powered menu.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <MainLayout files={files}>
          {children}
        </MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
