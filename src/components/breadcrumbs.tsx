"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  // list of repo markdown file paths as returned by `getRepoFiles()` (e.g. 'project/extended/Letta.md')
  files?: string[];
};

export default function Breadcrumbs({ files }: Props) {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  // create a lowercase set for case-insensitive matching (more robust across OSes)
  const fileSet = new Set((files || []).map((f) => f.toLowerCase()));

  const hrefHasPage = (href: string) => {
    const repoPath = href.replace(/^\//, "").replace(/\s+/g, "-");
    if (!repoPath) return false;
    const candidates = [
      `${repoPath}.md`,
      `${repoPath}/index.md`,
      `${repoPath}/README.md`,
    ];
    return candidates.some((c) => fileSet.has(c.toLowerCase()));
  };

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4">
      <ol className="flex gap-2 text-xs text-muted-foreground py-2">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        {parts.map((part, idx) => {
          const href = `/${parts.slice(0, idx + 1).join("/")}`;
          const label = decodeURIComponent(part).replace(/[-_]/g, " ");
          const isLast = idx === parts.length - 1;
          const shouldLink = !isLast && hrefHasPage(href);

          return (
            <li key={href} className="truncate">
              <span className="text-muted-foreground">/</span>{" "}
              {isLast ? (
                <span className="capitalize">{label}</span>
              ) : shouldLink ? (
                <Link href={href} className="hover:underline capitalize">
                  {label}
                </Link>
              ) : (
                <span className="capitalize">{label}</span>
              )}
            </li>
          );
        })}
      </ol>

      {/* JSON-LD BreadcrumbList for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: (() => {
            try {
              const origin =
                typeof window !== "undefined" ? window.location.origin : "";
              const itemListElements = [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: `${origin}/`,
                },
                ...parts.map((part, idx) => ({
                  "@type": "ListItem",
                  position: idx + 2,
                  name: decodeURIComponent(part).replace(/[-_]/g, " "),
                  item: `${origin}/${parts.slice(0, idx + 1).join("/")}`,
                })),
              ];
              return JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: itemListElements,
              });
            } catch {
              return "";
            }
          })(),
        }}
      />
    </nav>
  );
}
