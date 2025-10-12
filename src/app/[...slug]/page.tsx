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
  const path = resolvedParams.slug.join("/");
  if (!path) {
    notFound();
  }

  const content = await getFileContent(path);

  const htmlContent = await marked.parse(content);

  return (
    <article
      className="max-w-4xl mx-auto markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const path = resolvedParams.slug.join("/");
  const content = await getFileContent(path);
  if (!content) {
    return { title: "Not found - Seon" };
  }

  // use first heading or filename as title
  const firstLine = content.split("\n").find(Boolean) || path;
  const title = (firstLine || path).replace(/^#\s*/, "").slice(0, 60);
  return { title: `${title} - Seon` };
}
