import { MetadataRoute } from 'next'
import { ALL_TOOLS } from '@/lib/tools-config'

const BASE_URL = 'https://cryptolabonline.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const toolUrls: MetadataRoute.Sitemap = ALL_TOOLS.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolUrls,
  ]
}
