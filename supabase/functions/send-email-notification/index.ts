// Habesha Connect email notification Edge Function
// Deploy with: supabase functions deploy send-email-notification
// Required secrets:
//   supabase secrets set RESEND_API_KEY=your_resend_api_key
//   supabase secrets set FROM_EMAIL="Habesha Connect <onboarding@resend.dev>"
// Optional:
//   supabase secrets set REPLY_TO_EMAIL="your-email@example.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Habesha Connect <onboarding@resend.dev>";
    const REPLY_TO_EMAIL = Deno.env.get("REPLY_TO_EMAIL") || undefined;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const to = String(body.to || "").trim().toLowerCase();
    const subject = String(body.subject || "Habesha Connect notification").trim();
    const message = String(body.message || "").trim();
    const fromName = String(body.fromName || "Habesha Connect").trim();

    if (!to || !to.includes("@")) {
      return new Response(JSON.stringify({ error: "A valid recipient email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeMessage = message
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\n", "<br>");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin-bottom:8px">${fromName}</h2>
        <p>${safeMessage}</p>
        <p style="color:#666;font-size:13px;margin-top:24px">Please log in to Habesha Connect to review this update.</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        reply_to: REPLY_TO_EMAIL,
      }),
    });

    const data = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: "Resend API error", details: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id || null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
