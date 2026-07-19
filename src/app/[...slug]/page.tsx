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

type ParsedFrontmatter = {
  title?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  canonical?: string;
  slug?: string;
  keywords?: string[];
  tags?: string[];
  authors?: string[];
};

type ParsedMarkdownDocument = {
  body: string;
  rawFrontmatter: string | null;
  frontmatter: ParsedFrontmatter;
  title: string;
  description?: string;
  keywords: string[];
  canonicalPath: string;
};

function resolveMarkdownPath(slug: string[]): string {
  if (slug.some((segment) => segment === ".." || segment === ".")) {
    notFound();
  }

  let path = slug.join("/");
  if (!path.endsWith(".md")) {
    path = `${path}.md`;
  }

  if (isHiddenMarkdownPath(path)) {
    notFound();
  }

  return path;
}

function splitFrontmatter(content: string) {
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    return { rawFrontmatter: null, body: content };
  }

  const lines = content.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    return { rawFrontmatter: null, body: content };
  }

  const closingIndex = lines.findIndex(
    (line, index) => index > 0 && line.trim() === "---",
  );
  if (closingIndex === -1) {
    return { rawFrontmatter: null, body: content };
  }

  return {
    rawFrontmatter: lines.slice(1, closingIndex).join("\n").trim(),
    body: lines
      .slice(closingIndex + 1)
      .join("\n")
      .trimStart(),
  };
}

function cleanScalar(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function parseInlineList(value: string): string[] {
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) => cleanScalar(item))
    .filter(Boolean);
}

function extractFrontmatterValue(
  rawFrontmatter: string,
  key: string,
): string | string[] | undefined {
  const lines = rawFrontmatter.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(new RegExp(`^${key}:\\s*(.*)$`, "i"));
    if (!match) {
      continue;
    }

    const inlineValue = match[1].trim();
    if (inlineValue) {
      if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
        return parseInlineList(inlineValue);
      }

      return cleanScalar(inlineValue);
    }

    const listValues: string[] = [];
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = lines[nextIndex];
      if (!nextLine.trim()) {
        if (listValues.length > 0) {
          break;
        }
        continue;
      }

      const listMatch = nextLine.match(/^\s*[-*]\s+(.+)$/);
      if (!listMatch) {
        break;
      }

      listValues.push(cleanScalar(listMatch[1]));
    }

    if (listValues.length > 0) {
      return listValues;
    }

    return undefined;
  }

  return undefined;
}

function toStringArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadingTitle(body: string): string | undefined {
  const headingLine = body
    .split(/\r?\n/)
    .find((line) => /^#\s+/.test(line.trim()));
  if (!headingLine) {
    return undefined;
  }

  return stripMarkdown(headingLine.replace(/^#\s+/, ""));
}

function extractDescription(body: string): string | undefined {
  const paragraphLine = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("---"));

  if (!paragraphLine) {
    return undefined;
  }

  return stripMarkdown(paragraphLine).slice(0, 200);
}

function normalizeCanonicalPath(
  value: string | undefined,
  fallbackPath: string,
): string {
  if (!value) {
    return `/${fallbackPath.replace(/\.md$/, "")}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname || `/${fallbackPath.replace(/\.md$/, "")}`;
    } catch {
      return `/${fallbackPath.replace(/\.md$/, "")}`;
    }
  }

  return value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`;
}

function parseMarkdownDocument(
  path: string,
  content: string,
): ParsedMarkdownDocument {
  const { rawFrontmatter, body } = splitFrontmatter(content);
  const frontmatter: ParsedFrontmatter = rawFrontmatter
    ? {
        title:
          typeof extractFrontmatterValue(rawFrontmatter, "title") === "string"
            ? (extractFrontmatterValue(rawFrontmatter, "title") as string)
            : undefined,
        description:
          typeof extractFrontmatterValue(rawFrontmatter, "description") ===
          "string"
            ? (extractFrontmatterValue(rawFrontmatter, "description") as string)
            : undefined,
        summary:
          typeof extractFrontmatterValue(rawFrontmatter, "summary") === "string"
            ? (extractFrontmatterValue(rawFrontmatter, "summary") as string)
            : undefined,
        excerpt:
          typeof extractFrontmatterValue(rawFrontmatter, "excerpt") === "string"
            ? (extractFrontmatterValue(rawFrontmatter, "excerpt") as string)
            : undefined,
        canonical:
          typeof extractFrontmatterValue(rawFrontmatter, "canonical") ===
          "string"
            ? (extractFrontmatterValue(rawFrontmatter, "canonical") as string)
            : undefined,
        slug:
          typeof extractFrontmatterValue(rawFrontmatter, "slug") === "string"
            ? (extractFrontmatterValue(rawFrontmatter, "slug") as string)
            : undefined,
        keywords: toStringArray(
          extractFrontmatterValue(rawFrontmatter, "keywords"),
        ),
        tags: toStringArray(extractFrontmatterValue(rawFrontmatter, "tags")),
        authors: toStringArray(
          extractFrontmatterValue(rawFrontmatter, "authors"),
        ),
      }
    : {};

  const title =
    frontmatter.title ||
    extractHeadingTitle(body) ||
    path.replace(/\.md$/, "").split("/").pop()?.replace(/[-_]/g, " ") ||
    "Document";

  const description =
    frontmatter.description ||
    frontmatter.summary ||
    frontmatter.excerpt ||
    extractDescription(body);

  const keywords = [
    ...(frontmatter.keywords || []),
    ...(frontmatter.tags || []),
  ].filter(Boolean);
  const canonicalSource = frontmatter.canonical || frontmatter.slug;

  return {
    body,
    rawFrontmatter,
    frontmatter,
    title,
    description,
    keywords,
    canonicalPath: normalizeCanonicalPath(canonicalSource, path),
  };
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://theseonproject.com";
}

function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = (await params) as { slug: string[] };
  const path = resolveMarkdownPath(resolvedParams.slug);
  const content = await getFileContent(path);
  const document = parseMarkdownDocument(path, content);
  const url = `${getBaseUrl()}${document.canonicalPath}`;
  const other: NonNullable<Metadata["other"]> = {
    "okf:present": document.rawFrontmatter ? "true" : "false",
    "okf:path": path,
  };

  if (document.frontmatter.title) {
    other["okf:title"] = document.frontmatter.title;
  }
  if (document.frontmatter.description) {
    other["okf:description"] = document.frontmatter.description;
  }
  if (document.frontmatter.summary) {
    other["okf:summary"] = document.frontmatter.summary;
  }
  if (document.frontmatter.excerpt) {
    other["okf:excerpt"] = document.frontmatter.excerpt;
  }
  if (document.keywords.length > 0) {
    other["okf:keywords"] = document.keywords.join(", ");
  }
  if (document.frontmatter.authors && document.frontmatter.authors.length > 0) {
    other["okf:authors"] = document.frontmatter.authors.join(", ");
  }

  return {
    title: document.title,
    description: document.description,
    keywords: document.keywords.length > 0 ? document.keywords : undefined,
    alternates: {
      canonical: document.canonicalPath,
    },
    openGraph: {
      type: "article",
      url: document.canonicalPath,
      title: document.title,
      description: document.description,
    },
    twitter: {
      card: "summary_large_image",
      title: document.title,
      description: document.description,
    },
    other,
  };
}

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
  const path = resolveMarkdownPath(resolvedParams.slug);

  const content = await getFileContent(path);
  const document = parseMarkdownDocument(path, content);
  const okfPayload = document.rawFrontmatter
    ? {
        path,
        url: `${getBaseUrl()}${document.canonicalPath}`,
        title: document.title,
        description: document.description,
        keywords: document.keywords,
        frontmatter: document.frontmatter,
        rawFrontmatter: document.rawFrontmatter,
      }
    : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: document.title,
    description: document.description,
    keywords: document.keywords,
    url: `${getBaseUrl()}${document.canonicalPath}`,
    author: document.frontmatter.authors?.map((name) => ({
      "@type": "Person",
      name,
    })),
  };

  const htmlContent = await marked.parse(document.body);
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
    <>
      {okfPayload ? (
        <script
          id="open-knowledge-format"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonForHtml(okfPayload),
          }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonForHtml(structuredData),
        }}
      />
      <article
        className="max-w-4xl mx-auto markdown-content"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </>
  );
}
