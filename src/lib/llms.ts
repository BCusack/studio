import { getFileContent, getRepoFiles } from "@/lib/github";

export type LlmsDoc = {
  path: string;
  url: string;
  title: string;
  description?: string;
  body: string;
};

export const SITE_NAME = "The Seon Project";
export const SITE_SUMMARY =
  "Open research and development project exploring a privacy-first, ambient (Zero UI) AI companion: always-on contextual awareness, a long-term memory graph, and local-first privacy.";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://theseonproject.com";
}

function cleanScalar(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDoc(content: string) {
  let frontmatter = "";
  let body = content;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (match) {
    frontmatter = match[1];
    body = content.slice(match[0].length).trimStart();
  }

  const fm = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "im"));
    return m ? cleanScalar(m[1]) : undefined;
  };

  const heading = body
    .split(/\r?\n/)
    .find((line) => /^#\s+/.test(line.trim()));
  const paragraph = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !/^(#|---|\||!\[|<)/.test(line));

  return {
    body,
    title: fm("title") || (heading ? stripMarkdown(heading.replace(/^#\s+/, "")) : undefined),
    description:
      fm("description") ||
      fm("summary") ||
      (paragraph ? stripMarkdown(paragraph).slice(0, 200) : undefined),
  };
}

function toUrl(path: string): string {
  const route = path
    .replace(/\.md$/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${getBaseUrl()}/${route}`;
}

/** Whitepaper first, then the rest alphabetically. */
function sortPaths(paths: string[]): string[] {
  return [...paths].sort((a, b) => {
    if (a === "Whitepaper.md") return -1;
    if (b === "Whitepaper.md") return 1;
    return a.localeCompare(b);
  });
}

export async function getLlmsDocs(): Promise<LlmsDoc[]> {
  const files = (await getRepoFiles()).filter((file) => file.endsWith(".md"));

  const results = await Promise.allSettled(
    sortPaths(files).map(async (path): Promise<LlmsDoc> => {
      const parsed = parseDoc(await getFileContent(path));
      return {
        path,
        url: toUrl(path),
        title:
          parsed.title ||
          path.replace(/\.md$/, "").split("/").pop()!.replace(/[-_]/g, " "),
        description: parsed.description,
        body: parsed.body,
      };
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<LlmsDoc> => r.status === "fulfilled")
    .map((r) => r.value);
}

export function groupBySection(docs: LlmsDoc[]): Map<string, LlmsDoc[]> {
  const groups = new Map<string, LlmsDoc[]>();
  for (const doc of docs) {
    const section = doc.path.includes("/") ? doc.path.split("/")[0] : "Core";
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section)!.push(doc);
  }
  return groups;
}

export const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Robots-Tag": "index, follow",
};
