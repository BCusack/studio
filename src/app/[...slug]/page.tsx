import { getFileContent, getRepoFiles } from "@/lib/github";
import { isHiddenMarkdownPath } from "@/lib/content-filters";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

marked.use(
  markedKatex({
    throwOnError: false,
    output: "html",
    nonStandard: true,
    strict: "ignore",
  }),
);

type Props = {
  params: Promise<{
    slug: string[];
  }>;
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
  // Reject path traversal attempts before any further processing
  if (
    resolvedParams.slug.some((segment) => segment === ".." || segment === ".")
  ) {
    notFound();
  }
  let path = resolvedParams.slug.join("/");
  if (!path.endsWith(".md")) {
    path = `${path}.md`;
  }

  if (isHiddenMarkdownPath(path)) {
    notFound();
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
    },
  );

  const sanitized = sanitizeHtml(htmlWithAnchors, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "del",
      "ins",
      "s",
      "code",
      "pre",
      "hr",
      "br",
      "div",
      "span",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "figure",
      "figcaption",
      "details",
      "summary",
      "sup",
      "sub",
      // KaTeX generates SVG for some constructs
      "svg",
      "path",
      "line",
      "rect",
      "circle",
      "g",
      "use",
      "defs",
      "clipPath",
      "mask",
      "text",
      "tspan",
      "annotation",
      "semantics",
      "math",
      "mrow",
      "mn",
      "mi",
      "mo",
      "msup",
      "msub",
      "msubsup",
      "mfrac",
      "mroot",
      "msqrt",
      "mtable",
      "mtr",
      "mtd",
      "munder",
      "mover",
      "munderover",
      "mspace",
      "mtext",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      code: ["class"],
      pre: ["class"],
      span: ["class", "style", "aria-hidden"],
      div: ["class", "style"],
      svg: [
        "xmlns",
        "width",
        "height",
        "viewBox",
        "class",
        "style",
        "aria-hidden",
        "focusable",
      ],
      path: [
        "d",
        "fill",
        "stroke",
        "stroke-width",
        "fill-rule",
        "clip-rule",
        "clip-path",
      ],
      line: ["x1", "x2", "y1", "y2", "stroke", "stroke-width"],
      rect: ["x", "y", "width", "height", "fill", "stroke"],
      circle: ["cx", "cy", "r", "fill", "stroke"],
      g: ["class", "style", "transform", "clip-path"],
      use: ["href", "xlink:href", "x", "y", "width", "height"],
      defs: [],
      clipPath: ["id"],
      mask: ["id"],
      text: ["x", "y", "class", "style", "transform"],
      tspan: ["x", "y", "class", "dy"],
      annotation: ["encoding"],
      math: ["xmlns", "display", "class"],
      "*": ["id"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
  });

  return (
    <article
      className="max-w-4xl mx-auto markdown-content"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let path = resolvedParams.slug.join("/");
  if (!path.endsWith(".md")) {
    path = `${path}.md`;
  }
  if (isHiddenMarkdownPath(path)) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
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
      line.trim().length > 20,
  );

  if (contentLines.length > 0) {
    description =
      contentLines[0]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
        .replace(/[*_`]/g, "") // Remove markdown formatting
        .slice(0, 160) + (contentLines[0].length > 160 ? "..." : "");
  }

  // Fallback description aligned with site positioning
  if (!description) {
    description = `Explore ${title} — insights on AI companions, Zero UI, and the future of human–AI interfaces.`;
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
