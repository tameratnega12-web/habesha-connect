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

    const lines = message.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const firstLine = lines[0] || subject;
    const details = lines.slice(1).map(line => {
      const idx = line.indexOf(':');
      if (idx > 0 && idx < 40) {
        const key = line.slice(0, idx);
        const val = line.slice(idx + 1).trim();
        return `<tr><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#475569;font-weight:700;width:38%">${escapeHtml(key)}</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827">${escapeHtml(val)}</td></tr>`;
      }
      return `<tr><td colspan="2" style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827">${escapeHtml(line)}</td></tr>`;
    }).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111;max-width:680px;margin:0 auto;background:#ffffff;padding:0;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
        <div style="background:#0f766e;color:#ffffff;padding:20px 22px">
          <div style="font-size:22px;font-weight:800;letter-spacing:.2px">Habesha Agenagn</div>
          <div style="font-size:13px;opacity:.9;margin-top:4px">Connecting Habesha Around the World</div>
        </div>
        <div style="padding:22px">
          <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px">${escapeHtml(subject)}</h2>
          <p style="margin:0 0 16px;color:#334155;font-size:15px">${escapeHtml(firstLine)}</p>
          ${details ? `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:16px 0"><tbody>${details}</tbody></table>` : ''}
          <p style="color:#475569;font-size:14px;margin-top:18px">Please log in to Habesha Agenagn to review this update.</p>
          <div style="margin-top:18px">
            <a href="https://habeshaagenagnapp.com" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:700">Open Dashboard</a>
          </div>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:14px 22px;color:#64748b;font-size:12px">
          This email was sent by Habesha Agenagn App. Website: habeshaagenagnapp.com
        </div>
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
