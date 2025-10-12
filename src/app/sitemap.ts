import { MetadataRoute } from 'next'
import { getRepoFiles } from '@/lib/github'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theseonproject.com'

    try {
        const files = await getRepoFiles()

        // Filter for markdown files and create sitemap entries
        const markdownFiles = files.filter(file =>
            file.endsWith('.md') || file.endsWith('.mdx')
        )

        const fileEntries: MetadataRoute.Sitemap = markdownFiles.map(file => {
            // Remove .md extension and convert to URL path
            const path = file.replace(/\.(md|mdx)$/, '')

            return {
                url: `${baseUrl}/${path}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: path === 'README' ? 0.9 : 0.7,
            }
        })

        // Add homepage and other static routes
        const staticEntries: MetadataRoute.Sitemap = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 1,
            }
        ]

        return [...staticEntries, ...fileEntries]
    } catch (error) {
        console.error('Error generating sitemap:', error)

        // Fallback sitemap with just homepage if there's an error
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 1,
            }
        ]
    }
}