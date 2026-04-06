import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://urban-rentals.es'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/login',
                '/dashboard/',
                '/fleet/',
                '/clients/',
                '/rentals/',
                '/billing/',
                '/expenses/',
                '/reports/',
                '/settings/',
                '/maintenance/',
                '/requests/',
                '/agents/',
                '/owners/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
