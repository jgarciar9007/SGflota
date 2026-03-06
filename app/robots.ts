import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://urban-rentals.es'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/fleet/', '/clients/', '/rentals/', '/billing/', '/expenses/', '/reports/', '/settings/'],
            // Disallowing private application routes from being indexed by search engines
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
