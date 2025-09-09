import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { DynamicMenu } from '@/components/dynamic-menu';
import { getFileContent, getRepoFiles } from '@/lib/github';
import { generateHomepageContent } from '@/ai/flows/homepage-content-generation';
import type { HomepageContentOutput } from '@/ai/schemas/homepage-content-schema';
import { FileText, Zap, Shield, Globe } from 'lucide-react';
import { ComponentType } from 'react';

const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  FileText,
  Zap,
  Shield,
  Globe,
  Bot,
};

async function getHomepageContent(): Promise<HomepageContentOutput | null> {
  try {
    const whitepaperContent = await getFileContent('Whitepaper.md');
    if (!whitepaperContent) {
      return null;
    }
    return await generateHomepageContent({ whitepaperContent });
  } catch (error) {
    console.error("Failed to generate homepage content:", error);
    return null;
  }
}

export default async function Home() {
  const files = await getRepoFiles();
  const homepageContent = await getHomepageContent();

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center gap-4">
          <svg
            className="size-16 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M2 7L12 12M22 7L12 12M12 2V12M12 22V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">
            {homepageContent?.title || 'Welcome to Seon'}
          </h1>
        </div>
        <p className="max-w-3xl text-lg text-muted-foreground">
          An intelligent document browser. Use the menu to navigate through Markdown files, or use the AI-powered search below to find what you're looking for.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {homepageContent ? homepageContent.sections.map((section, index) => {
          const Icon = iconMap[section.icon] || FileText;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Icon className="text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          )
        }) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore the documentation using the menu.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-12 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot className="text-primary" />
            AI-Powered Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Leverages a GenAI model to create a dynamic navigation menu based on your search query.
          </p>
          <DynamicMenu allFiles={files} />
        </CardContent>
      </Card>
    </div>
  );
}
