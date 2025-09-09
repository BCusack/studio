import { getFileContent } from '@/lib/github';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    slug: string[];
  };
};

export async function generateMetadata({ params }: Props) {
  const path = params.slug.join('/');
  const fileName = path.split('/').pop()?.replace('.md', '') || 'Document';
  return {
    title: `${fileName} | Seon Explorer`,
  };
}

export default async function MarkdownPage({ params }: Props) {
  const path = params.slug.join('/');
  if (!path) {
    notFound();
  }

  const content = await getFileContent(path);

  if (!content || content.startsWith('Error loading content')) {
    notFound();
  }
  
  const htmlContent = await marked.parse(content);

  return (
    <article
      className="max-w-4xl mx-auto markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
