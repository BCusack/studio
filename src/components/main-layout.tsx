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
import { Menu, Github } from "lucide-react";

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
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
