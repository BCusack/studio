'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, Folder, Github, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import { DynamicMenu } from './dynamic-menu';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import React from 'react';

type FileTree = {
  [key: string]: FileTree | string;
};

const buildFileTree = (paths: string[]): FileTree => {
  const tree: FileTree = {};
  paths.forEach(path => {
    let currentLevel = tree;
    const parts = path.split('/');
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        currentLevel[part] = path;
      } else {
        currentLevel[part] = currentLevel[part] || {};
        currentLevel = currentLevel[part] as FileTree;
      }
    });
  });
  return tree;
};

const renderFileTree = (tree: FileTree, pathname: string | null) => {
  return Object.entries(tree).map(([name, content]) => {
    const fileName = name.replace('.md', '');

    if (typeof content === 'string') {
      return (
        <SidebarMenuItem key={content}>
          <SidebarMenuButton asChild isActive={`/${content}` === pathname} tooltip={fileName}>
            <Link href={`/${content}`}>
              <FileText />
              <span>{fileName}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    } else {
      return (
        <SidebarMenuItem key={name}>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <Folder />
                <span>{name}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {renderFileTree(content, pathname)}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      );
    }
  });
};


export default function MainLayout({ files, children }: { files: string[], children: ReactNode }) {
  const pathname = usePathname();
  const fileTree = buildFileTree(files);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
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
            <h1 className="font-headline text-lg font-semibold">Seon Explorer</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Home">
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <DynamicMenu allFiles={files} />

            <SidebarGroup>
              <SidebarGroupLabel>All Files</SidebarGroupLabel>
              <SidebarMenu>
                {renderFileTree(fileTree, pathname)}
              </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="https://github.com/BCusack/Seon" target="_blank" rel="noopener noreferrer">
                    <Github />
                    <span>Source Repository</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center border-b px-4 lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Future content like breadcrumbs can go here */}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
