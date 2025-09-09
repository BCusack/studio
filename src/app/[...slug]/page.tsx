import { getFileContent } from "@/lib/github";
import { marked } from "marked";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string[];
  };
};

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
