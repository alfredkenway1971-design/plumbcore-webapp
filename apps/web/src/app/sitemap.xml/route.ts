import { NextResponse } from 'next/server';

const SITE_URL = 'https://plumbcore-ai.vercel.app';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/login', priority: '0.6', changefreq: 'monthly' },
  { path: '/signup', priority: '0.8', changefreq: 'monthly' },
  { path: '/reset-password', priority: '0.3', changefreq: 'monthly' },
  { path: '/billing', priority: '0.4', changefreq: 'monthly' },
  { path: '/dashboard', priority: '0.5', changefreq: 'daily' },
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(p => `
  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
