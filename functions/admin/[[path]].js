const API = 'https://maixpo-api.khalidgraphy-com.workers.dev';

export async function onRequest(context) {
  return new Response(adminHtml(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function adminHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MAIXPO Admin</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080808;--surface:#111;--border:rgba(245,242,236,0.08);
  --text:#f5f2ec;--muted:rgba(245,242,236,0.45);--accent:#e8ff00;
  --accent2:#ff4d00;--radius:2px;
}
body{background:var(--bg);color:var(--text);font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;min-height:100vh}
a{color:var(--accent);text-decoration:none}

/* AUTH */
#auth{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.auth-box{width:100%;max-width:380px;background:var(--surface);border:1px solid var(--border);padding:40px}
.auth-logo{font-size:22px;font-weight:900;letter-spacing:5px;margin-bottom:32px}
.auth-logo span{color:var(--accent)}
.auth-step{display:none}
.auth-step.active{display:block}
.auth-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.auth-input{width:100%;background:#1a1a1a;border:1px solid var(--border);color:var(--text);padding:12px 14px;font-size:14px;outline:none;border-radius:var(--radius)}
.auth-input:focus{border-color:var(--accent)}
.auth-btn{width:100%;background:var(--accent);color:#080808;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:13px;border:none;cursor:pointer;margin-top:16px;border-radius:var(--radius)}
.auth-btn:hover{background:#d4eb00}
.auth-btn:disabled{opacity:0.5;cursor:not-allowed}
.auth-msg{font-size:12px;margin-top:12px;min-height:18px}
.auth-msg.error{color:var(--accent2)}
.auth-msg.success{color:var(--accent)}
.auth-back{font-size:12px;color:var(--muted);cursor:pointer;margin-top:12px;display:inline-block}
.auth-back:hover{color:var(--text)}
.auth-warn{background:rgba(255,77,0,0.07);border:1px solid rgba(255,77,0,0.22);padding:14px 16px;margin-bottom:20px;border-radius:var(--radius)}
.auth-warn-title{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent2);margin-bottom:5px}
.auth-warn-text{font-size:11px;color:rgba(245,242,236,0.45);line-height:1.65}

/* APP SHELL */
#app{display:none;min-height:100vh;flex-direction:column}
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:10}
.topbar-logo{font-size:16px;font-weight:900;letter-spacing:4px}
.topbar-logo span{color:var(--accent)}
.topbar-right{display:flex;align-items:center;gap:16px;font-size:12px;color:var(--muted)}
.topbar-email{font-size:11px}
.logout-btn{background:none;border:1px solid var(--border);color:var(--muted);padding:5px 12px;cursor:pointer;font-size:11px;letter-spacing:1px;border-radius:var(--radius)}
.logout-btn:hover{border-color:var(--text);color:var(--text)}

.tabs{background:var(--surface);border-bottom:1px solid var(--border);display:flex;padding:0 24px;overflow-x:auto}
.tab{padding:14px 18px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.tab:hover:not(.active){color:var(--text)}

.panel{flex:1;padding:24px;display:none}
.panel.active{display:block}

/* COMMON */
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:gap}
.section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
input[type=text],input[type=email],input[type=number],select,textarea{
  background:#1a1a1a;border:1px solid var(--border);color:var(--text);padding:8px 12px;font-size:13px;outline:none;border-radius:var(--radius)
}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
select{cursor:pointer}
textarea{resize:vertical;font-family:inherit}
.btn{padding:8px 16px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border:none;cursor:pointer;border-radius:var(--radius);font-weight:700}
.btn-accent{background:var(--accent);color:#080808}
.btn-accent:hover{background:#d4eb00}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{color:var(--text);border-color:rgba(245,242,236,0.25)}
.btn-danger{background:transparent;color:var(--accent2);border:1px solid rgba(255,77,0,0.3)}
.btn-danger:hover{background:rgba(255,77,0,0.1)}
.btn:disabled{opacity:0.4;cursor:not-allowed}

/* TABLE */
.tbl-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius)}
table{width:100%;border-collapse:collapse;min-width:600px}
thead{background:#161616}
th{padding:10px 14px;text-align:left;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);white-space:nowrap}
td{padding:10px 14px;border-top:1px solid var(--border);vertical-align:middle;font-size:13px}
tr:hover td{background:rgba(245,242,236,0.02)}
.badge{display:inline-block;padding:2px 8px;font-size:10px;letter-spacing:1px;text-transform:uppercase;border-radius:var(--radius)}
.badge-paid{background:rgba(232,255,0,0.12);color:var(--accent)}
.badge-pending{background:rgba(255,255,255,0.05);color:var(--muted)}
.badge-new{background:rgba(255,255,255,0.05);color:var(--muted)}
.badge-contacted{background:rgba(59,130,246,0.15);color:#60a5fa}
.badge-confirmed{background:rgba(232,255,0,0.12);color:var(--accent)}
.badge-declined{background:rgba(255,77,0,0.12);color:var(--accent2)}
.badge-active{background:rgba(232,255,0,0.12);color:var(--accent)}
.badge-inactive{background:rgba(255,77,0,0.12);color:var(--accent2)}

.empty{padding:48px;text-align:center;color:var(--muted);font-size:13px}
.loading{padding:48px;text-align:center;color:var(--muted)}

/* MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(8,8,8,0.85);display:none;align-items:center;justify-content:center;z-index:100;padding:24px}
.modal-bg.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);padding:32px;max-width:480px;width:100%}
.modal-title{font-size:13px;font-weight:700;letter-spacing:1px;margin-bottom:20px}
.modal-row{margin-bottom:16px}
.modal-row label{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.modal-row input,.modal-row select,.modal-row textarea{width:100%}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}

/* SETTINGS */
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:480px}
.setting-row{background:var(--surface);border:1px solid var(--border);padding:20px}
.setting-key{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.setting-row input{width:100%;margin-bottom:10px}
.price-display{font-size:22px;font-weight:700;color:var(--accent);margin-bottom:8px}

/* PAGINATION */
.pagination{display:flex;gap:8px;align-items:center;margin-top:16px;font-size:12px;color:var(--muted)}
.page-btn{padding:4px 10px;border:1px solid var(--border);background:none;color:var(--muted);cursor:pointer;border-radius:var(--radius)}
.page-btn:hover{color:var(--text);border-color:rgba(245,242,236,0.25)}
.page-btn:disabled{opacity:0.3;cursor:not-allowed}
</style>
</head>
<body>

<!-- AUTH -->
<div id="auth">
  <div class="auth-box">
    <div class="auth-logo">MAI<span>XPO</span> <span style="font-size:11px;letter-spacing:2px;color:var(--muted)">ADMIN</span></div>

    <div class="auth-step active" id="step-access">
      <div class="auth-warn">
        <div class="auth-warn-title">&#9888; Restricted Access</div>
        <div class="auth-warn-text">This system is monitored. All access attempts are logged with IP address, network provider, and timestamp. Only authorized staff may proceed. Unauthorized access is a violation of system policy.</div>
      </div>
      <div class="auth-label">Access Code</div>
      <input class="auth-input" type="password" id="inp-access" placeholder="Enter access code" autocomplete="off">
      <button class="auth-btn" id="btn-continue-access">Continue</button>
      <div class="auth-msg" id="msg-access"></div>
    </div>

    <div class="auth-step" id="step-email">
      <div class="auth-label">Admin Email</div>
      <input class="auth-input" type="email" id="inp-email" placeholder="your@email.com" autocomplete="email">
      <button class="auth-btn" id="btn-send-otp">Send Login Code</button>
      <div class="auth-msg" id="msg-email"></div>
    </div>

    <div class="auth-step" id="step-otp">
      <div class="auth-label">6-Digit Code</div>
      <input class="auth-input" type="text" id="inp-otp" placeholder="000000" maxlength="6" inputmode="numeric" autocomplete="one-time-code">
      <button class="auth-btn" id="btn-verify-otp">Verify &amp; Enter</button>
      <div class="auth-msg" id="msg-otp"></div>
      <span class="auth-back" id="back-to-email">&#8592; Use a different email</span>
    </div>
  </div>
</div>

<!-- APP -->
<div id="app" style="display:none;flex-direction:column">
  <div class="topbar">
    <div class="topbar-logo">MAI<span>XPO</span></div>
    <div class="topbar-right">
      <span class="topbar-email" id="admin-email-display"></span>
      <button class="logout-btn" id="btn-logout">Logout</button>
    </div>
  </div>

  <div class="tabs">
    <div class="tab active" data-tab="registrations">Registrations</div>
    <div class="tab" data-tab="promos">Promo Codes</div>
    <div class="tab" data-tab="pricing">Pricing</div>
    <div class="tab" data-tab="sponsors">Sponsors</div>
    <div class="tab" data-tab="insights">Insights</div>
  </div>

  <!-- REGISTRATIONS -->
  <div class="panel active" id="panel-registrations">
    <div class="section-head">
      <span class="section-title">Registrations</span>
      <div class="toolbar">
        <input type="text" id="reg-search" placeholder="Search name, email, company..." style="width:240px">
        <select id="reg-status-filter">
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <button class="btn btn-ghost" id="btn-export-csv">Export CSV</button>
      </div>
    </div>
    <div id="reg-count" style="font-size:11px;color:var(--muted);margin-bottom:12px"></div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Company</th><th>City</th><th>Tier</th><th>Status</th><th>Promo</th><th>Date</th><th></th>
          </tr>
        </thead>
        <tbody id="reg-tbody"><tr><td colspan="10" class="loading">Loading...</td></tr></tbody>
      </table>
    </div>
    <div class="pagination" id="reg-pagination"></div>
  </div>

  <!-- PROMOS -->
  <div class="panel" id="panel-promos">
    <div class="section-head">
      <span class="section-title">Promo Codes</span>
      <button class="btn btn-accent" id="btn-add-promo">+ Add Code</button>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Code</th><th>Discount</th><th>Max Uses</th><th>Used</th><th>Status</th><th></th></tr>
        </thead>
        <tbody id="promo-tbody"><tr><td colspan="6" class="loading">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

  <!-- PRICING -->
  <div class="panel" id="panel-pricing">
    <div class="section-head"><span class="section-title">Pricing &amp; Early Bird</span></div>
    <div class="settings-grid" id="settings-grid">
      <div class="loading">Loading...</div>
    </div>
  </div>

  <!-- SPONSORS -->
  <div class="panel" id="panel-sponsors">
    <div class="section-head">
      <span class="section-title">Sponsor Inquiries</span>
      <button class="btn btn-accent" id="btn-add-sponsor">+ Add Inquiry</button>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Company</th><th>Tier</th><th>Contact</th><th>Email</th><th>Status</th><th>Date</th><th></th></tr>
        </thead>
        <tbody id="sponsor-tbody"><tr><td colspan="7" class="loading">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

  <!-- INSIGHTS -->
  <div class="panel" id="panel-insights">
    <div class="section-head">
      <span class="section-title">Insights Posts</span>
      <button class="btn btn-accent" id="btn-add-insight">+ New Post</button>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Slug</th><th>Tags</th><th>Status</th><th>Published</th><th></th></tr>
        </thead>
        <tbody id="insight-tbody"><tr><td colspan="6" class="loading">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<!-- MODAL: Email registrant -->
<div class="modal-bg" id="modal-email">
  <div class="modal">
    <div class="modal-title">Send Email</div>
    <div class="modal-row"><label>To</label><input type="text" id="email-to" readonly style="opacity:0.5"></div>
    <div class="modal-row"><label>Subject</label><input type="text" id="email-subject" placeholder="Subject..."></div>
    <div class="modal-row"><label>Message</label><textarea id="email-body" rows="6" placeholder="Your message..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-email')">Cancel</button>
      <button class="btn btn-accent" id="btn-send-email">Send</button>
    </div>
  </div>
</div>

<!-- MODAL: Add promo -->
<div class="modal-bg" id="modal-promo">
  <div class="modal">
    <div class="modal-title">Add Promo Code</div>
    <div class="modal-row"><label>Code</label><input type="text" id="promo-code-inp" placeholder="LAUNCH20" style="text-transform:uppercase"></div>
    <div class="modal-row"><label>Discount %</label><input type="number" id="promo-disc" placeholder="20" min="1" max="100"></div>
    <div class="modal-row"><label>Max Uses (leave blank = unlimited)</label><input type="number" id="promo-max" placeholder=""></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-promo')">Cancel</button>
      <button class="btn btn-accent" id="btn-create-promo">Create</button>
    </div>
  </div>
</div>

<!-- MODAL: Add sponsor -->
<div class="modal-bg" id="modal-sponsor">
  <div class="modal">
    <div class="modal-title">Add Sponsor Inquiry</div>
    <div class="modal-row"><label>Company Name</label><input type="text" id="sp-company" placeholder="Acme Corp"></div>
    <div class="modal-row"><label>Sponsorship Tier</label>
      <select id="sp-tier"><option>Platinum</option><option>Gold</option><option selected>Silver</option><option>Bronze</option><option>Media</option></select>
    </div>
    <div class="modal-row"><label>Contact Name</label><input type="text" id="sp-contact" placeholder="Jane Smith"></div>
    <div class="modal-row"><label>Contact Email</label><input type="email" id="sp-email" placeholder="jane@acme.com"></div>
    <div class="modal-row"><label>Notes</label><textarea id="sp-notes" rows="3" placeholder="Any notes..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-sponsor')">Cancel</button>
      <button class="btn btn-accent" id="btn-create-sponsor">Add</button>
    </div>
  </div>
</div>

<!-- MODAL: New insight post -->
<div class="modal-bg" id="modal-insight">
  <div class="modal" style="max-width:640px">
    <div class="modal-title">New Insights Post</div>
    <div class="modal-row"><label>Title</label><input type="text" id="ins-title" placeholder="Post title"></div>
    <div class="modal-row"><label>Slug (URL path)</label><input type="text" id="ins-slug" placeholder="my-post-slug"></div>
    <div class="modal-row"><label>Author</label><input type="text" id="ins-author" placeholder="MAIXPO Team" value="MAIXPO Team"></div>
    <div class="modal-row"><label>Tags (comma separated)</label><input type="text" id="ins-tags" placeholder="AI Marketing,B2B"></div>
    <div class="modal-row"><label>Excerpt</label><textarea id="ins-excerpt" rows="3" placeholder="Short description..."></textarea></div>
    <div class="modal-row"><label>Content (HTML)</label><textarea id="ins-content" rows="10" placeholder="<p>Post content...</p>" style="font-family:monospace;font-size:12px"></textarea></div>
    <div class="modal-row"><label>Status</label>
      <select id="ins-status"><option value="draft">Draft</option><option value="published">Published</option></select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-insight')">Cancel</button>
      <button class="btn btn-accent" id="btn-create-insight">Create Post</button>
    </div>
  </div>
</div>

<script>
const API = '${API}';
let TOKEN = sessionStorage.getItem('maixpo_admin_token') || '';
let ADMIN_EMAIL = '';
let ACCESS_CODE = '';
let currentRegPage = 1;
let emailRegId = null;

function authFetch(path, opts = {}) {
  return fetch(API + path, {
    ...opts,
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function checkAuth() {
  if (!TOKEN) { showAuth(); return; }
  try {
    const r = await authFetch('/api/admin/me');
    if (r.ok) { const d = await r.json(); showApp(d.email); }
    else { TOKEN = ''; sessionStorage.removeItem('maixpo_admin_token'); showAuth(); }
  } catch { showAuth(); }
}

function showAuth() {
  document.getElementById('auth').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function showApp(email) {
  ADMIN_EMAIL = email;
  document.getElementById('admin-email-display').textContent = email;
  document.getElementById('auth').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  loadRegistrations();
}

document.getElementById('btn-continue-access').addEventListener('click', () => {
  const code = document.getElementById('inp-access').value.trim();
  const msg = document.getElementById('msg-access');
  if (!code) { msg.textContent = 'Enter the access code to continue.'; msg.className = 'auth-msg error'; return; }
  ACCESS_CODE = code;
  document.getElementById('step-access').classList.remove('active');
  document.getElementById('step-email').classList.add('active');
  msg.textContent = '';
});

document.getElementById('inp-access').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-continue-access').click(); });

document.getElementById('btn-send-otp').addEventListener('click', async () => {
  const email = document.getElementById('inp-email').value.trim();
  const msg = document.getElementById('msg-email');
  const btn = document.getElementById('btn-send-otp');
  if (!email) { msg.textContent = 'Enter your email.'; msg.className = 'auth-msg error'; return; }
  btn.disabled = true; btn.textContent = 'Sending...';
  msg.textContent = ''; msg.className = 'auth-msg';
  try {
    const r = await fetch(API + '/api/admin/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, access_code: ACCESS_CODE }) });
    const d = await r.json();
    if (r.ok) {
      document.getElementById('step-email').classList.remove('active');
      document.getElementById('step-otp').classList.add('active');
      document.getElementById('msg-otp').textContent = 'Code sent to ' + email;
      document.getElementById('msg-otp').className = 'auth-msg success';
    } else if (d.error === 'Invalid access code') {
      document.getElementById('step-email').classList.remove('active');
      document.getElementById('step-access').classList.add('active');
      document.getElementById('inp-access').value = '';
      ACCESS_CODE = '';
      document.getElementById('msg-access').textContent = 'Incorrect access code. Try again.';
      document.getElementById('msg-access').className = 'auth-msg error';
    } else {
      msg.textContent = d.error || 'Failed to send code.'; msg.className = 'auth-msg error';
    }
  } catch { msg.textContent = 'Network error.'; msg.className = 'auth-msg error'; }
  btn.disabled = false; btn.textContent = 'Send Login Code';
});

document.getElementById('btn-verify-otp').addEventListener('click', async () => {
  const email = document.getElementById('inp-email').value.trim();
  const otp = document.getElementById('inp-otp').value.trim();
  const msg = document.getElementById('msg-otp');
  const btn = document.getElementById('btn-verify-otp');
  btn.disabled = true; btn.textContent = 'Verifying...';
  msg.textContent = ''; msg.className = 'auth-msg';
  try {
    const r = await fetch(API + '/api/admin/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
    const d = await r.json();
    if (r.ok) {
      TOKEN = d.token; sessionStorage.setItem('maixpo_admin_token', TOKEN);
      showApp(email);
    } else {
      msg.textContent = d.error || 'Invalid code.'; msg.className = 'auth-msg error';
    }
  } catch { msg.textContent = 'Network error.'; msg.className = 'auth-msg error'; }
  btn.disabled = false; btn.textContent = 'Verify & Enter';
});

document.getElementById('back-to-email').addEventListener('click', () => {
  document.getElementById('step-otp').classList.remove('active');
  document.getElementById('step-email').classList.add('active');
  document.getElementById('inp-otp').value = '';
  document.getElementById('msg-otp').textContent = '';
});

document.getElementById('inp-email').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-send-otp').click(); });
document.getElementById('inp-otp').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-verify-otp').click(); });

document.getElementById('btn-logout').addEventListener('click', () => {
  TOKEN = ''; ACCESS_CODE = ''; sessionStorage.removeItem('maixpo_admin_token');
  showAuth();
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-otp').value = '';
  document.getElementById('inp-access').value = '';
  document.getElementById('msg-access').textContent = '';
  document.getElementById('step-otp').classList.remove('active');
  document.getElementById('step-email').classList.remove('active');
  document.getElementById('step-access').classList.add('active');
});

// ─── TABS ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    const loaders = { promos: loadPromos, pricing: loadSettings, sponsors: loadSponsors, insights: loadInsights };
    if (loaders[tab.dataset.tab]) loaders[tab.dataset.tab]();
  });
});

// ─── REGISTRATIONS ───────────────────────────────────────────────────────────

async function loadRegistrations(page = 1) {
  currentRegPage = page;
  const search = document.getElementById('reg-search').value.trim();
  const status = document.getElementById('reg-status-filter').value;
  const tbody = document.getElementById('reg-tbody');
  tbody.innerHTML = '<tr><td colspan="10" class="loading">Loading...</td></tr>';
  const r = await authFetch(\`/api/admin/registrations?page=\${page}&search=\${encodeURIComponent(search)}&status=\${status}\`);
  if (!r.ok) { tbody.innerHTML = '<tr><td colspan="10" class="empty">Failed to load.</td></tr>'; return; }
  const { registrations, total, limit } = await r.json();
  document.getElementById('reg-count').textContent = total + ' total registrations';
  if (!registrations.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty">No results.</td></tr>'; updateRegPagination(0, 0, 0); return; }
  tbody.innerHTML = registrations.map(reg => {
    const date = reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '';
    const promo = reg.promo_code ? \`\${reg.promo_code} (\${reg.promo_discount_pct}%)\` : '';
    return \`<tr>
      <td style="color:var(--muted)">\${reg.id}</td>
      <td style="font-weight:600">\${esc(reg.full_name)}</td>
      <td>\${esc(reg.email)}</td>
      <td>\${esc(reg.company || '')}</td>
      <td>\${esc(reg.city)}</td>
      <td style="text-transform:capitalize">\${reg.ticket_tier}</td>
      <td><span class="badge badge-\${reg.payment_status}">\${reg.payment_status}</span></td>
      <td style="font-size:11px;color:var(--muted)">\${esc(promo)}</td>
      <td style="font-size:11px;color:var(--muted)">\${date}</td>
      <td><button class="btn btn-ghost" onclick="openEmailModal(\${reg.id}, '\${esc(reg.email)}')" style="font-size:10px;padding:4px 10px">Email</button></td>
    </tr>\`;
  }).join('');
  updateRegPagination(total, page, limit);
}

function updateRegPagination(total, page, limit) {
  const pag = document.getElementById('reg-pagination');
  if (!total) { pag.innerHTML = ''; return; }
  const totalPages = Math.ceil(total / limit);
  pag.innerHTML = \`
    <button class="page-btn" \${page <= 1 ? 'disabled' : ''} onclick="loadRegistrations(\${page - 1})">&#8592;</button>
    <span>Page \${page} of \${totalPages}</span>
    <button class="page-btn" \${page >= totalPages ? 'disabled' : ''} onclick="loadRegistrations(\${page + 1})">&#8594;</button>
  \`;
}

let regSearchTimer;
document.getElementById('reg-search').addEventListener('input', () => { clearTimeout(regSearchTimer); regSearchTimer = setTimeout(() => loadRegistrations(1), 400); });
document.getElementById('reg-status-filter').addEventListener('change', () => loadRegistrations(1));

document.getElementById('btn-export-csv').addEventListener('click', async () => {
  const r = await fetch(API + '/api/admin/registrations/export.csv', { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  if (!r.ok) { alert('Export failed'); return; }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'maixpo-registrations.csv'; a.click();
  URL.revokeObjectURL(url);
});

function openEmailModal(regId, email) {
  emailRegId = regId;
  document.getElementById('email-to').value = email;
  document.getElementById('email-subject').value = '';
  document.getElementById('email-body').value = '';
  document.getElementById('modal-email').classList.add('open');
}

document.getElementById('btn-send-email').addEventListener('click', async () => {
  const subject = document.getElementById('email-subject').value.trim();
  const message = document.getElementById('email-body').value.trim();
  if (!subject || !message) { alert('Subject and message required'); return; }
  const btn = document.getElementById('btn-send-email');
  btn.disabled = true; btn.textContent = 'Sending...';
  const r = await authFetch(\`/api/admin/registrations/\${emailRegId}/email\`, { method: 'POST', body: JSON.stringify({ subject, message }) });
  btn.disabled = false; btn.textContent = 'Send';
  if (r.ok) { closeModal('modal-email'); alert('Email sent.'); }
  else { const d = await r.json(); alert('Failed: ' + (d.error || 'unknown')); }
});

// ─── PROMO CODES ──────────────────────────────────────────────────────────────

async function loadPromos() {
  const tbody = document.getElementById('promo-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
  const r = await authFetch('/api/admin/promo-codes');
  if (!r.ok) { tbody.innerHTML = '<tr><td colspan="6" class="empty">Failed to load.</td></tr>'; return; }
  const { codes } = await r.json();
  if (!codes.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No promo codes yet.</td></tr>'; return; }
  tbody.innerHTML = codes.map(c => \`<tr>
    <td style="font-family:monospace;font-weight:700;letter-spacing:1px">\${esc(c.code)}</td>
    <td>\${c.discount_pct}%</td>
    <td style="color:var(--muted)">\${c.max_uses || '&#8734;'}</td>
    <td>\${c.used_count}</td>
    <td><span class="badge badge-\${c.active ? 'active' : 'inactive'}">\${c.active ? 'Active' : 'Off'}</span></td>
    <td style="display:flex;gap:8px">
      <button class="btn btn-ghost" style="font-size:10px;padding:4px 10px" onclick="togglePromo('\${c.code}')">\${c.active ? 'Disable' : 'Enable'}</button>
      <button class="btn btn-danger" style="font-size:10px;padding:4px 10px" onclick="deletePromo('\${c.code}')">Delete</button>
    </td>
  </tr>\`).join('');
}

document.getElementById('btn-add-promo').addEventListener('click', () => {
  document.getElementById('promo-code-inp').value = '';
  document.getElementById('promo-disc').value = '';
  document.getElementById('promo-max').value = '';
  document.getElementById('modal-promo').classList.add('open');
});

document.getElementById('btn-create-promo').addEventListener('click', async () => {
  const code = document.getElementById('promo-code-inp').value.trim().toUpperCase();
  const disc = document.getElementById('promo-disc').value;
  const max = document.getElementById('promo-max').value;
  if (!code || !disc) { alert('Code and discount required'); return; }
  const r = await authFetch('/api/admin/promo-codes', { method: 'POST', body: JSON.stringify({ code, discount_pct: parseInt(disc), max_uses: max ? parseInt(max) : null }) });
  if (r.ok) { closeModal('modal-promo'); loadPromos(); }
  else { const d = await r.json(); alert(d.error || 'Failed'); }
});

async function togglePromo(code) {
  await authFetch(\`/api/admin/promo-codes/\${code}/toggle\`, { method: 'PATCH' });
  loadPromos();
}

async function deletePromo(code) {
  if (!confirm('Delete promo code ' + code + '?')) return;
  await authFetch(\`/api/admin/promo-codes/\${code}\`, { method: 'DELETE' });
  loadPromos();
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

async function loadSettings() {
  const grid = document.getElementById('settings-grid');
  grid.innerHTML = '<div class="loading">Loading...</div>';
  const r = await authFetch('/api/admin/settings');
  if (!r.ok) { grid.innerHTML = '<div class="empty">Failed to load.</div>'; return; }
  const { settings } = await r.json();
  const std = (parseInt(settings.price_standard || '3999') / 100).toFixed(2);
  const vip = (parseInt(settings.price_vip || '9999') / 100).toFixed(2);
  const ebActive = settings.early_bird_active === '1';
  const ebEnd = settings.early_bird_end ? new Date(parseInt(settings.early_bird_end) * 1000).toISOString().split('T')[0] : '';

  grid.innerHTML = \`
    <div class="setting-row">
      <div class="setting-key">Standard Ticket (USD)</div>
      <div class="price-display">$\${std}</div>
      <input type="number" id="inp-std" value="\${std}" step="0.01" min="1">
      <button class="btn btn-accent" style="width:100%;margin-top:8px" onclick="savePrice('standard')">Save</button>
    </div>
    <div class="setting-row">
      <div class="setting-key">VIP Ticket (USD)</div>
      <div class="price-display">$\${vip}</div>
      <input type="number" id="inp-vip" value="\${vip}" step="0.01" min="1">
      <button class="btn btn-accent" style="width:100%;margin-top:8px" onclick="savePrice('vip')">Save</button>
    </div>
    <div class="setting-row" style="grid-column:1/-1">
      <div class="setting-key">Early Bird</div>
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="eb-active" \${ebActive ? 'checked' : ''} style="width:auto;accent-color:var(--accent)">
          <span>Active</span>
        </label>
        <div>
          <span style="font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-right:8px">End date</span>
          <input type="date" id="eb-end" value="\${ebEnd}" style="width:auto">
        </div>
      </div>
      <button class="btn btn-accent" onclick="saveEarlyBird()">Save Early Bird Settings</button>
    </div>
  \`;
}

async function savePrice(tier) {
  const inp = document.getElementById('inp-' + (tier === 'standard' ? 'std' : 'vip'));
  const cents = Math.round(parseFloat(inp.value) * 100);
  if (!cents || cents < 100) { alert('Enter a valid price'); return; }
  const key = tier === 'standard' ? 'price_standard' : 'price_vip';
  const r = await authFetch('/api/admin/settings', { method: 'POST', body: JSON.stringify({ [key]: String(cents) }) });
  if (r.ok) { alert('Saved.'); loadSettings(); }
  else alert('Failed');
}

async function saveEarlyBird() {
  const active = document.getElementById('eb-active').checked ? '1' : '0';
  const endVal = document.getElementById('eb-end').value;
  const endTs = endVal ? String(Math.floor(new Date(endVal).getTime() / 1000)) : '';
  const body = { early_bird_active: active };
  if (endTs) body.early_bird_end = endTs;
  const r = await authFetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(body) });
  if (r.ok) alert('Saved.');
  else alert('Failed');
}

// ─── SPONSORS ─────────────────────────────────────────────────────────────────

async function loadSponsors() {
  const tbody = document.getElementById('sponsor-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
  const r = await authFetch('/api/admin/sponsors');
  if (!r.ok) { tbody.innerHTML = '<tr><td colspan="7" class="empty">Failed to load.</td></tr>'; return; }
  const { sponsors } = await r.json();
  if (!sponsors.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty">No sponsor inquiries yet.</td></tr>'; return; }
  tbody.innerHTML = sponsors.map(s => {
    const date = s.created_at ? new Date(s.created_at * 1000).toLocaleDateString() : '';
    return \`<tr>
      <td style="font-weight:600">\${esc(s.sponsor_name)}</td>
      <td>\${esc(s.tier)}</td>
      <td>\${esc(s.contact_name)}</td>
      <td style="font-size:12px">\${esc(s.email)}</td>
      <td><span class="badge badge-\${s.status}">\${s.status}</span></td>
      <td style="font-size:11px;color:var(--muted)">\${date}</td>
      <td>
        <select onchange="updateSponsorStatus(\${s.id}, this.value)" style="font-size:11px;padding:4px 8px">
          \${['new','contacted','confirmed','declined'].map(st => \`<option value="\${st}" \${s.status===st?'selected':''}>\${st}</option>\`).join('')}
        </select>
      </td>
    </tr>\`;
  }).join('');
}

document.getElementById('btn-add-sponsor').addEventListener('click', () => {
  ['sp-company','sp-contact','sp-email','sp-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modal-sponsor').classList.add('open');
});

document.getElementById('btn-create-sponsor').addEventListener('click', async () => {
  const sponsor_name = document.getElementById('sp-company').value.trim();
  const tier = document.getElementById('sp-tier').value;
  const contact_name = document.getElementById('sp-contact').value.trim();
  const email = document.getElementById('sp-email').value.trim();
  const notes = document.getElementById('sp-notes').value.trim();
  if (!sponsor_name || !contact_name || !email) { alert('Company name, contact name, and email required'); return; }
  const r = await authFetch('/api/admin/sponsors', { method: 'POST', body: JSON.stringify({ sponsor_name, tier, contact_name, email, notes }) });
  if (r.ok) { closeModal('modal-sponsor'); loadSponsors(); }
  else { const d = await r.json(); alert(d.error || 'Failed'); }
});

async function updateSponsorStatus(id, status) {
  await authFetch(\`/api/admin/sponsors/\${id}/status\`, { method: 'PATCH', body: JSON.stringify({ status }) });
  loadSponsors();
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────

async function loadInsights() {
  const tbody = document.getElementById('insight-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
  const r = await authFetch('/api/admin/insights');
  if (!r.ok) { tbody.innerHTML = '<tr><td colspan="6" class="empty">Failed to load.</td></tr>'; return; }
  const { posts } = await r.json();
  if (!posts.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No posts yet.</td></tr>'; return; }
  tbody.innerHTML = posts.map(p => {
    const date = p.published_at ? new Date(p.published_at * 1000).toLocaleDateString() : '';
    return \`<tr>
      <td style="font-weight:600">\${esc(p.title)}</td>
      <td style="font-family:monospace;font-size:11px;color:var(--muted)">\${esc(p.slug)}</td>
      <td style="font-size:11px;color:var(--muted)">\${esc(p.tags || '')}</td>
      <td><span class="badge badge-\${p.status==='published'?'paid':'pending'}">\${p.status}</span></td>
      <td style="font-size:11px;color:var(--muted)">\${date}</td>
      <td>
        <button class="btn btn-ghost" style="font-size:10px;padding:4px 10px" onclick="toggleInsight(\${p.id}, '\${p.status}')">\${p.status==='published'?'Unpublish':'Publish'}</button>
      </td>
    </tr>\`;
  }).join('');
}

document.getElementById('btn-add-insight').addEventListener('click', () => {
  ['ins-title','ins-slug','ins-tags','ins-excerpt','ins-content'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ins-author').value = 'MAIXPO Team';
  document.getElementById('ins-status').value = 'draft';
  document.getElementById('modal-insight').classList.add('open');
});

document.getElementById('ins-title').addEventListener('input', () => {
  const slug = document.getElementById('ins-title').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  document.getElementById('ins-slug').value = slug;
});

document.getElementById('btn-create-insight').addEventListener('click', async () => {
  const title = document.getElementById('ins-title').value.trim();
  const slug = document.getElementById('ins-slug').value.trim();
  const author = document.getElementById('ins-author').value.trim() || 'MAIXPO Team';
  const tags = document.getElementById('ins-tags').value.trim();
  const excerpt = document.getElementById('ins-excerpt').value.trim();
  const content_html = document.getElementById('ins-content').value.trim();
  const status = document.getElementById('ins-status').value;
  if (!title || !slug) { alert('Title and slug required'); return; }
  const published_at = status === 'published' ? Math.floor(Date.now() / 1000) : null;
  const r = await authFetch('/api/admin/insights', { method: 'POST', body: JSON.stringify({ title, slug, author, tags, excerpt, content_html, status, published_at }) });
  if (r.ok) { closeModal('modal-insight'); loadInsights(); }
  else { const d = await r.json(); alert(d.error || 'Failed'); }
});

async function toggleInsight(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const body = { status: newStatus };
  if (newStatus === 'published') body.published_at = Math.floor(Date.now() / 1000);
  await authFetch(\`/api/admin/insights/\${id}\`, { method: 'PATCH', body: JSON.stringify(body) });
  loadInsights();
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-bg').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));

checkAuth();
</script>
</body>
</html>`;
}
