// src/app/api/sitemap/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.decodenext.dev/';
  
  // Core pages
  const routes = [
    '',

    // Add other static routes here
  ].map(route => ({
    loc: `${baseUrl}${route}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Create XML content
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Return response with correct content-type
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}