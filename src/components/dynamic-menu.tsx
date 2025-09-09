'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { generateDynamicMenu } from '@/ai/flows/dynamic-menu-generation';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, FileText, Bot } from 'lucide-react';

export function DynamicMenu({ allFiles }: { allFiles: string[] }) {
  const [query, setQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedFiles(null);

    try {
      const result = await generateDynamicMenu({
        fileNames: allFiles.map(f => f.split('/').pop() || ''), // Send only filenames to the AI
        userQuery: query,
      });

      // The AI returns just filenames; we need to find the full paths from our original list
      const fullPaths = result.selectedFiles.map(selectedName => {
        return allFiles.find(fullPath => (fullPath.split('/').pop() || '') === selectedName);
      }).filter((path): path is string => !!path);
      
      setSelectedFiles(fullPaths);

    } catch (err) {
      console.error(err);
      setError('Failed to generate menu. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileName = (path: string) => path.split('/').pop()?.replace('.md', '') || '';

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Bot className="size-4" />
        AI Menu
      </SidebarGroupLabel>
      <form onSubmit={handleSubmit} className="px-2 pb-2 space-y-2">
        <div className="relative">
          <Input
            placeholder="Search docs with AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
            disabled={isLoading}
            aria-label="Search"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>
      </form>
      {error && <p className="px-2 text-sm text-destructive">{error}</p>}
      {selectedFiles && (
        <SidebarMenu>
          {selectedFiles.length > 0 ? selectedFiles.map(file => (
            <SidebarMenuItem key={file}>
              <Link href={`/${file}`} legacyBehavior passHref>
                <SidebarMenuButton isActive={`/${file}` === pathname} tooltip={getFileName(file)}>
                  <FileText />
                  <span>{getFileName(file)}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )) : (
            <p className="px-2 text-sm text-muted-foreground">No relevant files found.</p>
          )}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
