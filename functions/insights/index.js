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
  html { scroll-behavior: smooth; }
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
  .page-header {
    padding: 160px 40px 80px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .page-header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 80% 20%, rgba(232,255,0,0.05) 0%, transparent 60%);
  }
  .section-label {
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 20px; position: relative; z-index: 1;
  }
  .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(56px, 8vw, 100px);
    line-height: 0.92; letter-spacing: 2px;
    color: var(--white); position: relative; z-index: 1;
  }
  .page-title span { color: var(--accent); }
  .page-subtitle {
    margin-top: 24px; font-size: 16px; color: var(--text-muted);
    max-width: 520px; line-height: 1.6; position: relative; z-index: 1;
  }
  .grid-container { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
  .posts-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2px;
  }
  .post-card {
    background: var(--mid); border: 1px solid var(--border);
    padding: 40px; text-decoration: none; color: inherit;
    display: flex; flex-direction: column; gap: 16px;
    transition: border-color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
  }
  .post-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent); transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s;
  }
  .post-card:hover { border-color: rgba(232,255,0,0.25); background: #1e1e1e; }
  .post-card:hover::before { transform: scaleX(1); }
  .post-tag {
    display: inline-block; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); background: rgba(232,255,0,0.08);
    border: 1px solid rgba(232,255,0,0.2); padding: 4px 10px; width: fit-content;
  }
  .post-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 22px; line-height: 1.25; color: var(--white);
  }
  .post-excerpt { font-size: 14px; color: var(--text-muted); line-height: 1.6; flex: 1; }
  .post-meta { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); }
  .post-date { font-size: 12px; color: var(--text-muted); letter-spacing: 0.5px; }
  .post-arrow { font-size: 18px; color: var(--accent); }
  .empty-state { text-align: center; padding: 120px 40px; color: var(--text-muted); }
  .empty-state h2 { font-family: 'Syne', sans-serif; font-size: 28px; color: var(--white); margin-bottom: 12px; }
  footer { background: #040404; border-top: 1px solid var(--border); padding: 48px 40px; margin-top: 80px; }
  .footer-bottom { display: flex; align-items: center; justify-content: space-between; }
  .footer-copy { font-size: 12px; color: var(--text-muted); }
  .footer-back { font-size: 13px; color: var(--text-muted); text-decoration: none; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
  .footer-back:hover { color: var(--accent); }
  @media (max-width: 768px) {
    nav { padding: 16px 20px; }
    .nav-links { display: none; }
    .page-header { padding: 120px 20px 60px; }
    .grid-container { padding: 40px 20px; }
    .posts-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
  }
</style>`;

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function onRequest(context) {
  const { DB } = context.env;

  let posts = [];
  try {
    const { results } = await DB.prepare(
      "SELECT slug, title, excerpt, author, tags, published_at FROM insights_posts WHERE status = 'published' ORDER BY published_at DESC"
    ).all();
    posts = results;
  } catch (_) {}

  const cards = posts.length
    ? posts.map(p => `
      <a href="/insights/${p.slug}" class="post-card">
        <span class="post-tag">${p.tags ? p.tags.split(',')[0].trim() : 'Insight'}</span>
        <h2 class="post-title">${p.title}</h2>
        <p class="post-excerpt">${p.excerpt || ''}</p>
        <div class="post-meta">
          <span class="post-date">${formatDate(p.published_at)}</span>
          <span class="post-arrow">&#8594;</span>
        </div>
      </a>`).join('')
    : `<div class="empty-state"><h2>Coming Soon</h2><p>Our first insights are on the way.</p></div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Insights &#8212; MAIXPO 2026</title>
<meta name="description" content="AI marketing insights, conference updates, and industry intelligence from the MAIXPO team.">
<link rel="canonical" href="https://maixpo.com/insights">
<meta property="og:title" content="Insights &#8212; MAIXPO 2026">
<meta property="og:description" content="AI marketing insights, conference updates, and industry intelligence from the MAIXPO team.">
<meta property="og:url" content="https://maixpo.com/insights">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="/img/icon1.png">
${STYLES}
</head>
<body>
${NAV}
<div class="page-header">
  <div class="section-label">Knowledge Hub</div>
  <h1 class="page-title">MAI<span>XPO</span><br>Insights</h1>
  <p class="page-subtitle">AI marketing intelligence, conference updates, and strategies from the frontlines of the industry.</p>
</div>
<div class="grid-container">
  <div class="posts-grid">${cards}</div>
</div>
<footer>
  <div class="footer-bottom">
    <span class="footer-copy">&#169; 2026 MAIXPO. AI Marketing Conference &amp; Expo. Kuala Lumpur, Malaysia.</span>
    <a href="/" class="footer-back">&#8592; Back to MAIXPO</a>
  </div>
</footer>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
