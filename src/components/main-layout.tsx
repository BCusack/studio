"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
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

  return (
    <div className="flex flex-col min-h-svh">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="size-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 7L12 12M22 7L12 12M12 2V12M12 22V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
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
