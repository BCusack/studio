'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, Github, Home } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { DynamicMenu } from './dynamic-menu';
import { ScrollArea } from './ui/scroll-area';

export default function MainLayout({ files, children }: { files: string[], children: ReactNode }) {
  const pathname = usePathname();

  const getFileName = (path: string) => path.split('/').pop()?.replace('.md', '') || '';

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
                {files.map(file => (
                  <SidebarMenuItem key={file}>
                    <SidebarMenuButton asChild isActive={`/${file}` === pathname} tooltip={getFileName(file)}>
                      <Link href={`/${file}`}>
                        <FileText />
                        <span>{getFileName(file)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <a href="https://github.com/BCusack/Seon" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github />
                    <span>Source Repository</span>
                </a>
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
