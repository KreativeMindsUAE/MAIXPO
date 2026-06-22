const ALLOWED_ORIGINS = [
  'https://maixpo.com',
  'https://www.maixpo.com',
  'https://maixpo.pages.dev',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

const VALID_TIERS = ['early_bird', 'standard', 'vip'];
const VALID_CITIES = ['KL', 'Dubai'];
const VALID_INDUSTRIES = ['agency', 'brand', 'saas', 'consulting', 'media', 'other'];
const VALID_AI_STAGES = ['not_yet', 'exploring', 'using'];
const VALID_GOALS = ['learn', 'network', 'hire', 'vendors', 'invest'];
const VALID_HEAR = ['social', 'colleague', 'google', 'email', 'other'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method === 'POST' && url.pathname === '/api/register') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, origin);
      }

      const { city, ticket_tier, full_name, email, company, job_title, industry, ai_stage, goals, hear_about } = body;

      // Required field validation
      if (!full_name?.trim()) return json({ error: 'Full name is required' }, 400, origin);
      if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Valid email is required' }, 400, origin);
      if (!company?.trim()) return json({ error: 'Company is required' }, 400, origin);
      if (!job_title?.trim()) return json({ error: 'Job title is required' }, 400, origin);
      if (!VALID_TIERS.includes(ticket_tier)) return json({ error: 'Invalid ticket tier' }, 400, origin);
      if (!VALID_CITIES.includes(city)) return json({ error: 'Invalid city' }, 400, origin);
      if (!VALID_INDUSTRIES.includes(industry)) return json({ error: 'Invalid industry' }, 400, origin);

      // Sanitize optional fields
      const safeAiStage = VALID_AI_STAGES.includes(ai_stage) ? ai_stage : null;
      const goalsArr = Array.isArray(goals) ? goals.filter(g => VALID_GOALS.includes(g)) : [];
      const safeHear = VALID_HEAR.includes(hear_about) ? hear_about : null;

      try {
        const result = await env.DB.prepare(
          `INSERT INTO registrations (city, ticket_tier, full_name, email, company, job_title, industry, ai_stage, goals, hear_about)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          city,
          ticket_tier,
          full_name.trim(),
          email.trim().toLowerCase(),
          company.trim(),
          job_title.trim(),
          industry,
          safeAiStage,
          goalsArr.join(',') || null,
          safeHear
        ).run();

        return json({ success: true, id: result.meta.last_row_id }, 200, origin);
      } catch (err) {
        return json({ error: 'Registration failed, please try again' }, 500, origin);
      }
    }

    return json({ error: 'Not found' }, 404, origin);
  },
};
