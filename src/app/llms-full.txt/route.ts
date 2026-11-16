import { SITE_NAME, SITE_SUMMARY, getLlmsDocs, textHeaders } from "@/lib/llms";

export const revalidate = 3600;

// Every document as plain markdown in one file, readable without HTML parsing.
export async function GET() {
  const docs = await getLlmsDocs();

  const parts: string[] = [`# ${SITE_NAME}`, "", `> ${SITE_SUMMARY}`, ""];

  for (const doc of docs) {
    parts.push(
      "---",
      "",
      `Source: ${doc.url}`,
      "",
      doc.body.trim(),
      "",
    );
  }

  return new Response(parts.join("\n"), { headers: textHeaders });
}
