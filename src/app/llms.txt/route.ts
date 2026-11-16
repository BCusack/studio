import {
  SITE_NAME,
  SITE_SUMMARY,
  getBaseUrl,
  getLlmsDocs,
  groupBySection,
  textHeaders,
} from "@/lib/llms";

export const revalidate = 3600;

// https://llmstxt.org — an index of the site's documents for AI tools.
export async function GET() {
  const docs = await getLlmsDocs();
  const baseUrl = getBaseUrl();

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_SUMMARY}`,
    "",
    `Full text of every document as plain markdown: ${baseUrl}/llms-full.txt`,
    `Source repository: https://github.com/BCusack/Seon`,
    "",
  ];

  for (const [section, sectionDocs] of groupBySection(docs)) {
    lines.push(`## ${section}`, "");
    for (const doc of sectionDocs) {
      lines.push(
        `- [${doc.title}](${doc.url})${doc.description ? `: ${doc.description}` : ""}`,
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), { headers: textHeaders });
}
