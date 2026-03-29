import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace this URL with your actual custom domain when you have one
  const baseUrl = 'https://qzwb.asia';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
