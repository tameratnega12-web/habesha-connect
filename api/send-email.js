const APP_NAME = 'Habesha Agenagn';
const WEBSITE = 'https://habeshaagenagnapp.com';
const SUPPORT = process.env.SUPPORT_EMAIL || 'support@habeshaagenagnapp.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `Habesha Agenagn <notifications@habeshaagenagnapp.com>`;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function detailsHtml(details) {
  if (!details || typeof details !== 'object') return '';
  const rows = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `<tr><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${escapeHtml(k)}</td><td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;">${escapeHtml(v)}</td></tr>`)
    .join('');
  return rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:18px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">${rows}</table>` : '';
}

function htmlTemplate({ name, subject, summary, buttonText, dashboardUrl, details }) {
  const safeName = escapeHtml(name || 'Habesha Agenagn User');
  const safeSubject = escapeHtml(subject || 'Habesha Agenagn Notification');
  const safeSummary = escapeHtml(summary || 'You have a new update in Habesha Agenagn.');
  const safeButton = escapeHtml(buttonText || 'Open Dashboard');
  const safeUrl = escapeHtml(dashboardUrl || WEBSITE);
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#0f766e,#111827);padding:24px;color:white;">
        <div style="width:52px;height:52px;border-radius:14px;background:#ffffff;color:#0f766e;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;">HA</div>
        <h1 style="margin:14px 0 0;font-size:24px;">${APP_NAME}</h1>
      </div>
      <div style="padding:26px;">
        <h2 style="margin:0 0 14px;font-size:22px;">${safeSubject}</h2>
        <p style="font-size:16px;line-height:1.55;margin:0 0 12px;">Hello ${safeName},</p>
        <p style="font-size:16px;line-height:1.55;margin:0 0 10px;">${safeSummary}</p>
        ${detailsHtml(details)}
        <p style="margin:24px 0;"><a href="${safeUrl}" style="background:#0f766e;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:10px;font-weight:700;display:inline-block;">${safeButton}</a></p>
        <p style="color:#6b7280;font-size:13px;line-height:1.5;margin-top:22px;">This is an automatic notification from Habesha Agenagn.</p>
      </div>
      <div style="background:#f9fafb;padding:18px 26px;color:#6b7280;font-size:13px;line-height:1.6;">
        Website: <a href="${WEBSITE}" style="color:#0f766e;">${WEBSITE}</a><br>
        Support: <a href="mailto:${SUPPORT}" style="color:#0f766e;">${SUPPORT}</a>
      </div>
    </div>
  </div></body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = Array.isArray(body.to) ? body.to : [body.to];
    const recipients = to.map(x => String(x || '').trim().toLowerCase()).filter(x => x && x.includes('@'));
    if (!recipients.length) return res.status(400).json({ error: 'Missing recipient email' });

    const subject = String(body.subject || 'Habesha Agenagn Notification').slice(0, 180);
    const html = htmlTemplate(body);
    const text = `${subject}\n\nHello ${body.name || 'Habesha Agenagn User'},\n\n${body.summary || 'You have a new update in Habesha Agenagn.'}\n\nOpen dashboard: ${body.dashboardUrl || WEBSITE}\n\nWebsite: ${WEBSITE}\nSupport: ${SUPPORT}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: recipients, subject, html, text })
    });
    const result = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) return res.status(resendRes.status).json({ error: result.message || 'Resend send failed', details: result });
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Email send failed' });
  }
};
