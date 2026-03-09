import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://urban-rentals.es'
    const now = new Date()

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        // Only public pages here. /fleet and others are management/admin.
        {
            url: `${baseUrl}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}
