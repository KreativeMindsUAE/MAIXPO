export async function onRequest(context) {
  const { DB } = context.env;

  let postUrls = '';
  try {
    const { results } = await DB.prepare(
      "SELECT slug, updated_at FROM insights_posts WHERE status = 'published' ORDER BY published_at DESC"
    ).all();
    postUrls = results.map(p => {
      const date = p.updated_at
        ? new Date(p.updated_at * 1000).toISOString().split('T')[0]
        : '2026-07-24';
      return `
  <url>
    <loc>https://maixpo.com/insights/${p.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('');
  } catch (_) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://maixpo.com/</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://maixpo.com/insights</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${postUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
