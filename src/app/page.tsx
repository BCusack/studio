import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import { Bot, FileText, Globe, Shield, Zap } from "lucide-react";
import { ProtectedDynamicMenu } from "@/components/protected-dynamic-menu";
import { getFileContent, getRepoFiles } from "@/lib/github";
import { generateHomepageContent } from "@/ai/flows/homepage-content-generation";
import { Storage } from "@google-cloud/storage";
import type { HomepageContentOutput } from "@/ai/schemas/homepage-content-schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { ComponentType } from "react";
import Logo from "@/components/logo";
import { unstable_cache } from "next/cache";

// Cache the homepage for 1 hour (3600 seconds)
export const revalidate = 3600;

// Use ISR instead of force-static to allow for dynamic content when needed
// export const dynamic = 'force-static';

const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  FileText,
  Zap,
  Shield,
  Globe,
  Bot,
};

// Cached version of getHomepageContent with 1 hour cache
const getCachedHomepageContent = unstable_cache(
  async (): Promise<HomepageContentOutput | null> => {
    return getHomepageContent();
  },
  ["homepage-content"],
  {
    revalidate: 3600, // 1 hour
    tags: ["homepage"],
  }
);

// Cached version of getRepoFiles with 1 hour cache
const getCachedRepoFiles = unstable_cache(
  async (): Promise<string[]> => {
    return getRepoFiles();
  },
  ["repo-files"],
  {
    revalidate: 3600, // 1 hour
    tags: ["repo-files"],
  }
);

// Generate dynamic metadata based on AI-generated content
export async function generateMetadata(): Promise<Metadata> {
  try {
    const homepageContent = await getCachedHomepageContent();

    const title =
      homepageContent?.title || "Seon | AI-Powered Documentation Platform";
    const description =
      homepageContent?.sections?.[0]?.content ||
      "Discover and explore documentation with AI-powered navigation. Transform GitHub repositories into intelligent, searchable knowledge bases with dynamic content generation.";

    const keywords = [
      "AI documentation",
      "intelligent search",
      "markdown explorer",
      "GitHub integration",
      "knowledge management",
      "content discovery",
      ...(homepageContent?.sections?.map((s) => s.title.toLowerCase()) || []),
    ];

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://theseonproject.com";

    return {
      title,
      description: description.slice(0, 160),
      keywords,
      openGraph: {
        title,
        description: description.slice(0, 160),
        url: baseUrl,
        type: "website",
        siteName: "Seon",
        images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.slice(0, 160),
        images: ["/og-image.png"],
      },
      alternates: {
        canonical: "/",
      },
    };
  } catch (error) {
    // Fallback metadata if anything fails
    return {
      title: "Seon | AI-Powered Documentation Platform",
      description:
        "Discover and explore documentation with AI-powered navigation.",
    };
  }
}

async function getHomepageContent(): Promise<HomepageContentOutput | null> {
  try {
    const bucketName =
      process.env.GCS_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
    const objectPath = "generated/homepage-content.json";

    if (bucketName) {
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(objectPath);

      // check if object exists
      try {
        const [exists] = await file.exists();
        if (exists) {
          const [contents] = await file.download();
          return JSON.parse(
            contents.toString("utf-8")
          ) as HomepageContentOutput;
        }
      } catch (e) {
        console.error("Failed to read from GCS:", e);
        // fallthrough to generate
      }
    }

    // Cache the whitepaper fetch for 1 hour
    const whitepaperContent = await fetch(
      "https://api.github.com/repos/BCusack/Seon/contents/Whitepaper.md?ref=main",
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.raw",
        },
        next: { revalidate: 3600 },
      }
    )
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null);

    if (!whitepaperContent) return null;

    // Only attempt generation if an API key is available at runtime
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn(
        "Skipping homepage generation: missing GEMINI_API_KEY/GOOGLE_API_KEY"
      );
      return null;
    }

    const generated = await generateHomepageContent({ whitepaperContent });

    // persist to GCS if bucket configured
    if (bucketName) {
      try {
        const storage = new Storage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(objectPath);
        await file.save(JSON.stringify(generated, null, 2), {
          resumable: false,
          contentType: "application/json",
        });
      } catch (e) {
        console.error("Failed to write generated homepage content to GCS:", e);
      }
    }

    return generated;
  } catch (error) {
    console.error("Failed to generate homepage content:", error);
    return null;
  }
}

export default async function Home() {
  // Load both operations in parallel using cached versions
  const [files, homepageContent] = await Promise.all([
    getCachedRepoFiles().catch(() => []), // Fallback to empty array if GitHub fails
    getCachedHomepageContent().catch(() => null), // Fallback to null if content generation fails
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-16">
        <div className="flex items-center gap-4">
          <Logo className="size-16 text-primary" ariaHidden={true} />
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">
            {homepageContent?.title || "Welcome to Seon"}
          </h1>
        </div>
        <p className="max-w-3xl text-lg text-muted-foreground">
          {homepageContent?.sections?.[0]?.content ||
            "Explore the future of human-computer interaction through our research and development project. Use the AI-powered search below to find what you're looking for."}
        </p>
        <div className="mt-6">
          <Link href="/Whitepaper.md" aria-label="Read the Seon white paper">
            <Button variant="inverted" size="lg" className="w-full md:w-auto">
              <Github />
              Read the Seon white paper
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-16 py-12">
        {homepageContent ? (
          homepageContent.sections.map((section, index) => {
            const Icon = iconMap[section.icon] || FileText;
            return (
              <section key={index} className="max-w-3xl mx-auto px-4">
                <div className="flex items-center gap-3">
                  <Icon className="size-8 text-primary" />
                  <h2 className="text-3xl font-bold font-headline">
                    {section.title}
                  </h2>
                </div>
                <p className="mt-4 text-lg text-muted-foreground">
                  {section.content}
                </p>
              </section>
            );
          })
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore the documentation using the menu.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-12 mb-16 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot className="text-primary" />
            AI-Powered Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Leverages a GenAI model to create a dynamic navigation menu based on
            your search query.
          </p>
          <ProtectedDynamicMenu allFiles={files} />
        </CardContent>
      </Card>
    </div>
  );
}
