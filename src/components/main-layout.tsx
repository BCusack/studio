"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import Logo from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu, Github, Heart } from "lucide-react";

type FileTree = {
  [key: string]: FileTree | string;
};

const buildFileTree = (paths: string[]): FileTree => {
  const tree: FileTree = {};
  paths.forEach((path) => {
    let currentLevel = tree;
    const parts = path.split("/");
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        currentLevel[part] = path;
      } else {
        currentLevel[part] = (currentLevel[part] as FileTree) || {};
        currentLevel = currentLevel[part] as FileTree;
      }
    });
  });
  return tree;
};

const renderDropdownTree = (tree: FileTree): React.ReactNode[] => {
  return Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, content]) => {
      const fileName = name.replace(".md", "");

      if (typeof content === "string") {
        return (
          <DropdownMenuItem key={content} asChild>
            <Link href={`/${content}`}>{fileName}</Link>
          </DropdownMenuItem>
        );
      } else {
        return (
          <DropdownMenuSub key={name}>
            <DropdownMenuSubTrigger>
              <span>{name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {renderDropdownTree(content)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }
    });
};

export default function MainLayout({
  files,
  children,
}: {
  files: string[];
  children: ReactNode;
}) {
  const fileTree = buildFileTree(files);

  // Paper read mode: persisted in localStorage and toggles a root class.
  // Modes: 'off' | 'default' | 'inverted'
  const [paperMode, setPaperMode] = useState<"off" | "default" | "inverted">(
    () => {
      try {
        return (
          (localStorage.getItem("paper-mode") as
            | "off"
            | "default"
            | "inverted") || "off"
        );
      } catch (e) {
        return "off";
      }
    }
  );

  useEffect(() => {
    const root = document.documentElement;
    // clear both possible classes then add the one we need
    root.classList.remove("paper-mode", "paper-mode-inverted");
    if (paperMode === "default") root.classList.add("paper-mode");
    else if (paperMode === "inverted")
      root.classList.add("paper-mode-inverted");

    try {
      localStorage.setItem("paper-mode", paperMode);
    } catch (e) {
      /* ignore */
    }
  }, [paperMode]);

  return (
    <div className="flex flex-col min-h-svh">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo
                className="size-6 text-primary"
                ariaHidden={true}
                strokeWidth={2}
              />
              <span className="font-bold font-headline">Seon</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>All Files</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {renderDropdownTree(fileTree)}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Paper read mode">
                  {/* simple page icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2z" />
                  </svg>
                  <span className="sr-only">Paper read mode</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Paper read mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    className="w-full text-right"
                    onClick={() => setPaperMode("off")}
                  >
                    Off
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    className="w-full text-right"
                    onClick={() => setPaperMode("default")}
                  >
                    Default
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    className="w-full text-right"
                    onClick={() => setPaperMode("inverted")}
                  >
                    Inverted
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="https://github.com/BCusack/Seon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon">
                <Github />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
            {/* Support dropdown: links to repository support pages. Assumption: sponsor URL follows GitHub Sponsors pattern for the owner. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Support">
                  <Heart />
                  <span className="sr-only">Support</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Support</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-3 py-2 flex flex-col gap-2">
                  <a
                    href="https://ko-fi.com/W7W31G9CXW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src="https://ko-fi.com/img/githubbutton_sm.svg"
                      alt="Support on Ko-fi"
                      width={120}
                      height={20}
                    />
                  </a>

                  <a
                    href="https://patreon.com/BrianCusack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src="https://img.shields.io/badge/Support-Patreon-orange.svg"
                      alt="Support on Patreon"
                      width={120}
                      height={20}
                    />
                  </a>

                  <a
                    href="https://www.buymeacoffee.com/falcon78"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                      alt="Buy Me A Coffee"
                      width={120}
                      height={20}
                    />
                  </a>
                  <div className="pt-1">
                    <iframe
                      src="https://github.com/sponsors/BCusack/button"
                      title="Sponsor BCusack"
                      height={32}
                      width={114}
                      style={{ border: 0, borderRadius: 6 }}
                    />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
