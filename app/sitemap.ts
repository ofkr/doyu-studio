import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://doyu.me', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://doyu.me/work', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://doyu.me/shop', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://doyu.me/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
