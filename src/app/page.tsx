import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FileCode, Github } from 'lucide-react';

export default function Home() {
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
            Welcome to Seon Explorer
          </h1>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          An intelligent document browser. Use the sidebar to navigate through Markdown files fetched from a GitHub repository, or use the AI-powered search to find what you're looking for.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Github className="text-primary" />
              GitHub Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Fetches and displays Markdown files directly from a public GitHub repository in real-time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bot className="text-primary" />
              AI-Powered Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Leverages a GenAI model to create a dynamic navigation menu based on your search query.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileCode className="text-primary" />
              Markdown Rendering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Renders Markdown content into beautifully styled, readable web pages with a Vercel-inspired dark theme.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
