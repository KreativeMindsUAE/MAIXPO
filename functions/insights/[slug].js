const NAV = `<nav>
  <a href="/" class="nav-logo"><img src="/img/icon1.png" alt="MAIXPO icon"><span class="nav-wordmark">MAI<span class="accent">XPO</span></span></a>
  <div class="nav-links">
    <a href="/#cities">Cities</a>
    <a href="/#agenda">Agenda</a>
    <a href="/#speakers">Speakers</a>
    <a href="/insights">Insights</a>
    <a href="/#tickets" class="nav-cta">Register Now</a>
  </div>
</nav>`;

const STYLES = `
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #080808;
    --white: #F5F2EC;
    --accent: #E8FF00;
    --accent2: #FF4D00;
    --mid: #1A1A1A;
    --border: rgba(245,242,236,0.12);
    --text-muted: rgba(245,242,236,0.5);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--black); color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: rgba(8,8,8,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 3px; color: var(--white); text-decoration: none; }
  .nav-logo img { height: 32px; width: auto; display: block; flex-shrink: 0; }
  .nav-wordmark { line-height: 1; }
  .nav-logo .accent { color: var(--accent); }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
  .nav-links a:hover { color: var(--white); }
  .nav-links a[href="/insights"] { color: var(--accent); }
  .nav-cta { background: var(--accent) !important; color: var(--black) !important; padding: 10px 22px; font-weight: 500 !important; letter-spacing: 0.5px !important; text-transform: uppercase !important; font-size: 12px !important; }
  .post-header {
    padding: 140px 40px 60px;
    border-bottom: 1px solid var(--border);
    max-width: 860px; margin: 0 auto;
    position: relative;
  }
  .breadcrumb { font-size: 12px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 28px; }
  .breadcrumb a { color: var(--accent); text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }
  .post-tag {
    display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); background: rgba(232,255,0,0.08);
    border: 1px solid rgba(232,255,0,0.2); padding: 4px 10px; margin-bottom: 24px;
  }
  .post-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(32px, 5vw, 56px); line-height: 1.1;
    color: var(--white); margin-bottom: 24px;
  }
  .post-meta { display: flex; gap: 24px; align-items: center; font-size: 13px; color: var(--text-muted); }
  .post-author { color: var(--white); font-weight: 500; }
  .post-body {
    max-width: 860px; margin: 0 auto;
    padding: 60px 40px 100px;
    font-size: 17px; line-height: 1.8; color: rgba(245,242,236,0.85);
  }
  .post-body h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 26px; color: var(--white); margin: 48px 0 16px; }
  .post-body h3 { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 20px; color: var(--white); margin: 36px 0 12px; }
  .post-body p { margin-bottom: 24px; }
  .post-body strong { color: var(--white); font-weight: 500; }
  .post-body ul, .post-body ol { margin: 0 0 24px 24px; }
  .post-body li { margin-bottom: 8px; }
  .post-body blockquote {
    border-left: 3px solid var(--accent); margin: 32px 0;
    padding: 16px 24px; background: rgba(232,255,0,0.04);
    font-size: 18px; font-style: italic; color: var(--white);
  }
  .cta-strip {
    background: var(--mid); border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    padding: 32px 40px; margin: 48px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
  }
  .cta-strip p { font-size: 16px; color: var(--white); font-weight: 400; margin: 0; }
  .cta-btn {
    background: var(--accent); color: var(--black);
    padding: 12px 28px; font-size: 13px; font-weight: 500;
    letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none;
    white-space: nowrap; flex-shrink: 0;
  }
  .cta-btn:hover { opacity: 0.9; }
  .back-link {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--text-muted); text-decoration: none; font-size: 13px;
    letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s;
    margin-bottom: 48px;
  }
  .back-link:hover { color: var(--accent); }
  footer { background: #040404; border-top: 1px solid var(--border); padding: 48px 40px; }
  .footer-bottom { display: flex; align-items: center; justify-content: space-between; max-width: 860px; margin: 0 auto; }
  .footer-copy { font-size: 12px; color: var(--text-muted); }
  .footer-back { font-size: 13px; color: var(--text-muted); text-decoration: none; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
  .footer-back:hover { color: var(--accent); }
  .not-found { max-width: 600px; margin: 160px auto; padding: 0 40px; text-align: center; }
  .not-found h1 { font-family: 'Bebas Neue', sans-serif; font-size: 72px; color: var(--accent); margin-bottom: 16px; }
  .not-found p { color: var(--text-muted); margin-bottom: 32px; }
  .not-found a { color: var(--accent); text-decoration: none; }
  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .post-header, .post-body { padding-left: 20px; padding-right: 20px; }
    .cta-strip { padding: 24px 20px; }
    .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
  }
</style>`;

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function onRequest(context) {
  const { DB } = context.env;
  const { slug } = context.params;

  let post = null;
  try {
    post = await DB.prepare(
      "SELECT * FROM insights_posts WHERE slug = ? AND status = 'published'"
    ).bind(slug).first();
  } catch (_) {}

  if (!post) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Not Found &#8212; MAIXPO Insights</title>
<link rel="icon" type="image/png" href="/img/icon1.png">
${STYLES}
</head>
<body>
${NAV}
<div class="not-found">
  <h1>404</h1>
  <p>This post doesn't exist or has been removed.</p>
  <a href="/insights">&#8592; Back to Insights</a>
</div>
</body>
</html>`;
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const tag = post.tags ? post.tags.split(',')[0].trim() : 'Insight';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} &#8212; MAIXPO Insights</title>
<meta name="description" content="${post.excerpt || ''}">
<link rel="canonical" href="https://maixpo.com/insights/${post.slug}">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.excerpt || ''}">
<meta property="og:url" content="https://maixpo.com/insights/${post.slug}">
<meta property="og:type" content="article">
<meta name="article:published_time" content="${post.published_at ? new Date(post.published_at * 1000).toISOString() : ''}">
<link rel="icon" type="image/png" href="/img/icon1.png">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${post.title.replace(/"/g, '\\"')}",
  "description": "${(post.excerpt || '').replace(/"/g, '\\"')}",
  "author": {"@type": "Organization", "name": "${post.author || 'MAIXPO Team'}"},
  "publisher": {"@type": "Organization", "name": "MAIXPO", "url": "https://maixpo.com"},
  "datePublished": "${post.published_at ? new Date(post.published_at * 1000).toISOString() : ''}",
  "url": "https://maixpo.com/insights/${post.slug}"
}
</script>
${STYLES}
</head>
<body>
${NAV}
<div class="post-header">
  <div class="breadcrumb"><a href="/insights">Insights</a> / ${tag}</div>
  <div class="post-tag">${tag}</div>
  <h1 class="post-title">${post.title}</h1>
  <div class="post-meta">
    <span class="post-author">${post.author || 'MAIXPO Team'}</span>
    <span>&#183;</span>
    <span>${formatDate(post.published_at)}</span>
  </div>
</div>
<div class="post-body">
  ${post.content_html || ''}
  <div class="cta-strip">
    <p>Join 6,500+ marketers at MAIXPO 2026 &#8212; Kuala Lumpur, October 28-29, 2026.</p>
    <a href="/#tickets" class="cta-btn">Get Your Ticket</a>
  </div>
  <a href="/insights" class="back-link">&#8592; All Insights</a>
</div>
<footer>
  <div class="footer-bottom">
    <span class="footer-copy">&#169; 2026 MAIXPO. AI Marketing Conference &amp; Expo.</span>
    <a href="/" class="footer-back">&#8592; Back to MAIXPO</a>
  </div>
</footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
