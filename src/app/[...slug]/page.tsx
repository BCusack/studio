import { getFileContent, getRepoFiles } from "@/lib/github";
import { marked } from "marked";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: {
    slug: string[];
  };
};

export async function generateStaticParams() {
  try {
    const files = await getRepoFiles();

    // Convert file paths to slug arrays
    const params = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        // Remove .md extension and split by /
        const slug = file.replace(/\.md$/, "").split("/").filter(Boolean);
        return { slug };
      });

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function MarkdownPage({ params }: Props) {
  const resolvedParams = (await params) as { slug: string[] };
  let path = resolvedParams.slug.join("/");
  if (!path.endsWith(".md")) {
    path = `${path}.md`;
  }

  const content = await getFileContent(path);

  const htmlContent = await marked.parse(content);
  const decodeEntities = (value: string) =>
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

  const htmlWithAnchors = htmlContent.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (match, level, inner) => {
      const plain = decodeEntities(inner)
        .replace(/<[^>]+>/g, "")
        .trim()
        .toLowerCase()
        .normalize("NFKD");

      const cleaned = plain.replace(/[^\w\s-]/g, "");
      const slug = cleaned.replace(/\s/g, "-").replace(/^-+|-+$/g, "");

      if (!slug) {
        return match;
      }

      return `<h${level} id="${slug}">${inner}</h${level}>`;
    }
  );

  return (
    <article
      className="max-w-4xl mx-auto markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlWithAnchors }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let path = resolvedParams.slug.join("/");
  if (!path.endsWith(".md")) {
    path = `${path}.md`;
  }
  const content = await getFileContent(path);

  if (!content) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  // Extract title from first heading or use filename
  const lines = content.split("\n").filter(Boolean);
  let title = path.replace(/\.(md|mdx)$/, "").replace(/\//g, " › ");
  let description = "";

  // Look for first heading
  const firstHeading = lines.find((line) => line.startsWith("#"));
  if (firstHeading) {
    title = firstHeading.replace(/^#+\s*/, "").trim();
  }

  // Extract description from first paragraph or first few non-heading lines
  const contentLines = lines.filter(
    (line) =>
      !line.startsWith("#") &&
      !line.startsWith("```") &&
      !line.startsWith("---") &&
      line.trim().length > 20
  );

  if (contentLines.length > 0) {
    description =
      contentLines[0]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
        .replace(/[*_`]/g, "") // Remove markdown formatting
        .slice(0, 160) + (contentLines[0].length > 160 ? "..." : "");
  }

  // Fallback description
  if (!description) {
    description = `Explore ${title} - comprehensive documentation and insights powered by AI.`;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://theseonproject.com";
  const url = `${baseUrl}/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${path}`,
    },
    openGraph: {
      title: `${title} | Seon`,
      description,
      url,
      type: "article",
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
      title: `${title} | Seon`,
      description,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
