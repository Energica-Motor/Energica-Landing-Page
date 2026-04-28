import type { MetadataRoute } from "next";

const BASE_URL = "https://energicamotor.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                        lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE_URL}/models`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/technology`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/racing`,            lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,           lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/dealers`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/test-ride`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/press`,             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/warranty`,          lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/owners`,            lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/cookies`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const modelSlugs = ["experia", "esseesse9", "eva-ribelle", "ego"];
  const modelRoutes: MetadataRoute.Sitemap = modelSlugs.map((slug) => ({
    url: `${BASE_URL}/models/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...modelRoutes];
}
