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

        const fileEntries: MetadataRoute.Sitemap = markdownFiles
            .map(file => {
                // Remove extension and convert to URL path
                const rawPath = file.replace(/\.(md|mdx)$/, '')

                // Skip root README as homepage is added separately
                if (rawPath.toLowerCase() === 'readme') return null

                // Encode each path segment for valid URLs
                const encodedPath = rawPath
                    .split('/')
                    .map(encodeURIComponent)
                    .join('/')

                return {
                    url: `${baseUrl}/${encodedPath}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                }
            })
            .filter((e): e is NonNullable<typeof e> => Boolean(e))

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