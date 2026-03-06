import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://urban-rentals.es'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/fleet`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        // We can add more specific public routes here as the app grows
        // Internal routes like dashboard, billing, etc. should NOT be in the sitemap
        // Assuming /login is the entry point to the private app
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}
