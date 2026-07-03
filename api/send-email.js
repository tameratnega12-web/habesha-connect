const DEFAULT_FROM = 'Habesha Agenagn <notifications@habeshaagenagnapp.com>';
const DEFAULT_ADMIN_EMAIL = 'habeshaconnect@gmail.com';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return json(res, 500, { error: 'Missing RESEND_API_KEY in Vercel Environment Variables' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let to = String(body.to || '').trim().toLowerCase();
    const adminEmail = String(process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();

    // Legacy app admin placeholder: route admin notifications to the real owner inbox.
    if (to === 'admin@habeshaconnect.com' || to === 'admin@habeshaagenagnapp.com') to = adminEmail;

    if (!to || !to.includes('@')) return json(res, 400, { error: 'A valid recipient email is required' });

    const subject = String(body.subject || 'Habesha Agenagn notification').slice(0, 180);
    const message = String(body.message || '').slice(0, 6000);
    const fromName = String(body.fromName || 'Habesha Agenagn').slice(0, 80);
    const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
    const replyTo = process.env.REPLY_TO_EMAIL || adminEmail;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111;max-width:640px;margin:0 auto;padding:16px">
        <h2 style="margin:0 0 12px;color:#0f766e">${escapeHtml(fromName)}</h2>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px">${escapeHtml(message)}</div>
        <p style="color:#6b7280;font-size:13px;margin-top:20px">Please log in to Habesha Agenagn to review this update.</p>
      </div>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
    });

    const data = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) return json(res, 500, { error: 'Resend API error', details: data });

    return json(res, 200, { ok: true, id: data.id || null, to });
  } catch (error) {
    return json(res, 500, { error: String(error && error.message ? error.message : error) });
  }
};
