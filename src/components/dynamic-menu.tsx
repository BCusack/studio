'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateDynamicMenu } from '@/ai/flows/dynamic-menu-generation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function DynamicMenu({ allFiles }: { allFiles: string[] }) {
  const [query, setQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedFiles(null);

    try {
      const result = await generateDynamicMenu({
        fileNames: allFiles.map(f => f.split('/').pop() || ''),
        userQuery: query,
      });

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
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
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
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {selectedFiles && (
        <Card className="mt-4">
          <CardContent className="p-4 space-y-2">
            {selectedFiles.length > 0 ? (
              <ul className="space-y-1">
                {selectedFiles.map(file => (
                  <li key={file}>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href={`/${file}`} className="flex items-center gap-2">
                        <FileText className="size-4" />
                        <span>{getFileName(file)}</span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No relevant files found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
