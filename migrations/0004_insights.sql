CREATE TABLE IF NOT EXISTS insights_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT,
  author TEXT DEFAULT 'MAIXPO Team',
  cover_image TEXT,
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  published_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_insights_published ON insights_posts(status, published_at DESC);

INSERT INTO insights_posts (slug, title, excerpt, content_html, author, tags, status, published_at) VALUES
(
  'why-ai-is-transforming-b2b-marketing-in-southeast-asia',
  'Why AI Is Transforming B2B Marketing in Southeast Asia',
  'The $4.2 trillion Southeast Asian digital economy is entering a new phase. AI is no longer a competitive edge for B2B marketers in the region — it is quickly becoming the baseline.',
  '<p>The $4.2 trillion Southeast Asian digital economy is entering a new phase. AI is no longer a competitive edge for B2B marketers in the region — it is quickly becoming the baseline. From demand generation to account-based marketing, the companies pulling ahead are those that embedded AI into their workflows two to three years ago.</p>

<h2>The SEA Advantage</h2>
<p>Southeast Asia occupies a unique position in the global AI marketing story. The region''s mobile-first infrastructure, diverse linguistic landscape, and rapidly growing middle class have forced marketers here to build for complexity from day one. That friction turned out to be training data for agility.</p>
<p>Brands operating across six or seven SEA markets simultaneously cannot afford the slow, campaign-by-campaign iteration that still dominates Western marketing playbooks. AI-powered personalisation, multilingual content engines, and predictive lead scoring have moved from "nice to have" to infrastructure.</p>

<h2>What the Numbers Show</h2>
<p>A 2025 study of 400 B2B marketers across Malaysia, Indonesia, Singapore, Thailand, the Philippines, and Vietnam found that companies using AI for at least two core marketing functions reported 31% higher qualified pipeline and 24% lower cost per acquisition compared to peers who had not yet adopted AI tools at scale.</p>
<p>The gap is widening. The same cohort showed a 19-point difference in marketing-attributed revenue growth year over year.</p>

<h2>Three Shifts Defining the Transition</h2>
<p><strong>From segmentation to prediction.</strong> Static audience segments built on demographic data are giving way to dynamic behavioural models that predict purchase intent before a prospect raises their hand. AI systems trained on intent signals, content consumption patterns, and firmographic data are reshaping how B2B pipeline is sourced.</p>
<p><strong>From content volume to content precision.</strong> The content marketing arms race of the 2010s produced a glut of generic material. AI now enables the opposite: highly specific, role-relevant content at scale, served at the moment of highest receptivity. The question is no longer "how much" but "how targeted."</p>
<p><strong>From reporting to forecasting.</strong> Marketing analytics has long been retrospective. AI-powered revenue intelligence platforms are shifting the function toward forward-looking models that give CMOs a defensible view of marketing''s contribution to next quarter''s number before the quarter begins.</p>

<blockquote>The marketers winning in Southeast Asia right now are not the ones with the biggest budgets. They are the ones who understood that AI is a multiplier on strategy, not a replacement for it.</blockquote>

<h2>What This Means for MAIXPO 2026</h2>
<p>These shifts form the backbone of the MAIXPO 2026 programme. Across two days in Kuala Lumpur, 50+ speakers — CMOs, AI leads, founders, and growth strategists — will share live case studies, tool demonstrations, and frameworks from real deployments across the region.</p>
<p>If you are building a B2B marketing function in SEA and want to understand exactly how AI is being applied at the companies growing fastest, MAIXPO 2026 is built for that conversation.</p>',
  'MAIXPO Team',
  'AI Marketing,B2B,Southeast Asia',
  'published',
  1753315200
),
(
  'maixpo-2026-what-to-expect-from-our-50-speakers',
  'MAIXPO 2026: What to Expect from Our 50+ Speakers',
  'MAIXPO 2026 brings together over 50 speakers across two days in Kuala Lumpur. Here is what the programme looks like and why the speaker mix was built this way.',
  '<p>MAIXPO 2026 brings together over 50 speakers across two days in Kuala Lumpur. The programme is not a series of polished keynotes designed to generate applause. It is built around one question: what is actually working in AI marketing right now, and how do you replicate it?</p>

<h2>The Speaker Mix</h2>
<p>The MAIXPO 2026 speaker roster spans three distinct profiles, each chosen deliberately.</p>
<p><strong>CMOs and VP-level marketing leaders</strong> from companies operating at scale in Southeast Asia. These are the people making budget decisions about AI tools today — their frameworks for evaluation, adoption, and measurement are the most practically useful content we can put on stage.</p>
<p><strong>AI product leads and founders</strong> building the tools the industry uses. We asked each of them to show — not just describe — what their platforms do. Every tool demonstration at MAIXPO is live, with real data, on stage.</p>
<p><strong>Growth strategists and practitioners</strong> who have run campaigns using AI workflows end to end. Their sessions are case-study format: here is the problem, here is what we built, here is what the numbers looked like after.</p>

<h2>Format: Sessions That Respect Your Time</h2>
<p>The MAIXPO programme is structured around 30-minute sessions with 10-minute Q&A blocks. There are no 90-minute keynotes. The reasoning is simple: the most actionable insights are the specific ones, and specificity requires focus, not runtime.</p>
<p>Workshops run in parallel tracks for attendees who want hands-on time with tools. Workshop seats are limited and included with VIP registration.</p>

<h2>Topics Across Both Days</h2>
<ul>
  <li>AI-powered demand generation and pipeline forecasting</li>
  <li>Multilingual content at scale for SEA markets</li>
  <li>Account-based marketing with predictive intent data</li>
  <li>AI in influencer and creator marketing</li>
  <li>Building AI-native marketing teams: hiring, structure, and culture</li>
  <li>Measurement frameworks for AI-assisted campaigns</li>
  <li>Live tool showcases: platforms, automations, and workflows</li>
</ul>

<blockquote>Every speaker was selected on one criterion: can they show us something real? Not a slide deck about potential — a live result, a working system, a number that moved.</blockquote>

<h2>The Exhibitor Floor</h2>
<p>Running alongside the main stage, 50+ exhibitors will have working demonstrations of AI marketing platforms, martech infrastructure, and data tools. The exhibitor floor is open throughout both days, giving attendees the opportunity to test tools without sitting through a sales pitch.</p>

<h2>Register Before Prices Increase</h2>
<p>Standard and VIP early-bird tickets are open now. Prices increase as we move closer to September. If you are planning to attend, the best time to register is before the next pricing tier takes effect.</p>',
  'MAIXPO Team',
  'Conference,Speakers,Programme',
  'published',
  1753401600
);
