// Vercel serverless function - newsletter signup.
//
// Same-origin POST from the footer newsletter form (/api/subscribe), so no
// CORS. CommonJS on purpose: this project has no deployed package.json, so
// Vercel runs .js functions as CommonJS. (global fetch is available on
// Node 18+.)
//
// What it does:
//   1. Validate the email server-side
//   2. Add the contact to Resend Contacts (POST /contacts; Resend replaced
//      Audiences with Contacts + Segments in Nov 2025, so no audience ID)
//   3. Send a short welcome email via Resend
//   4. Return JSON so the inline [data-newsletter-status] handler can show
//      success/error inline without changing the markup
//
// Required env vars in Vercel:
//   RESEND_API_KEY        Resend API key (secret) - needs contacts:write + emails:send
//
// Optional env vars:
//   RESEND_SEGMENT_ID     Optional Resend Segment ID. If set, new signups are
//                         also added to that segment (e.g. "Newsletter").
//   NEWSLETTER_FROM       e.g. "Bangin' & Beats <hello@banginandbeats.com>"
//                         Must be on a domain you've verified in Resend.
//                         Defaults to "Bangin' & Beats <onboarding@resend.dev>"
//                         which only works for sending to your own verified
//                         account email - fine for testing, not production.
//   NEWSLETTER_REPLY_TO   e.g. "info@banginandbeats.com" (optional)
//
// The inquiry/booking forms stay on Formspree. Do NOT route them through here.

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) {
      if (typeof req.body === 'object') return resolve(req.body);
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const WELCOME_SUBJECT = "You\u2019re locked in: Bangin\u2019 & Beats\u2122";
const EVENTS_URL = 'https://www.banginandbeats.com/events';

function welcomeHtml() {
  // Plain, on-brand. No images, no tracking pixels. Keep it short.
  return [
    '<!doctype html>',
    '<html><body style="margin:0;padding:0;background:#0A0A0A;color:#FFF8E7;font-family:Helvetica,Arial,sans-serif;">',
    '<div style="max-width:520px;margin:0 auto;padding:32px 24px;">',
    '<p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin:0 0 12px;color:#D4AF37;">Bangin\u2019 &amp; Beats\u2122</p>',
    '<h1 style="font-size:22px;letter-spacing:-.01em;margin:0 0 16px;color:#FFF8E7;">You\u2019re locked in.</h1>',
    '<p style="font-size:16px;line-height:1.55;margin:0 0 14px;color:#C9BFA8;">',
    'Thanks for joining the Bangin\u2019 &amp; Beats\u2122 list. New cities, fresh dates, and early ticket drops ',
    'land in your inbox first. Real history, zero spam.',
    '</p>',
    '<p style="margin:22px 0;"><a href="' + EVENTS_URL + '" style="display:inline-block;background:#D4AF37;color:#0A0A0A;',
    'font-weight:700;text-decoration:none;padding:12px 22px;border-radius:999px;">See upcoming tour dates</a></p>',
    '<p style="font-size:16px;line-height:1.55;margin:0 0 14px;color:#C9BFA8;">',
    'Want a private party before then? Hit reply or text 201-344-4589.',
    '</p>',
    '<p style="font-size:13px;line-height:1.55;margin:24px 0 0;color:#C9A86A;">',
    'High Class Experience LLC \u00b7 info@banginandbeats.com<br>',
    'Retro music nostalgia for people who love real culture.',
    '</p>',
    '</div></body></html>',
  ].join('');
}

function welcomeText() {
  return [
    "You're locked in.",
    '',
    "Thanks for joining the Bangin' & Beats list. New cities, fresh dates, and early",
    'ticket drops land in your inbox first. Real history, zero spam.',
    '',
    'See upcoming tour dates: ' + EVENTS_URL,
    '',
    'Want a private party before then? Hit reply or text 201-344-4589.',
    '',
    'High Class Experience LLC \u00b7 info@banginandbeats.com',
    'Retro music nostalgia for people who love real culture.',
  ].join('\n');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const body = await readBody(req);
  const email = (body.email || '').toString().trim().toLowerCase();
  const firstName = (body.firstName || '').toString().trim();

  // Server-side validation - never trust the client.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('subscribe: missing RESEND_API_KEY');
    res.status(500).json({ error: 'server not configured' });
    return;
  }

  const from = process.env.NEWSLETTER_FROM
    || "Bangin' & Beats <onboarding@resend.dev>"; // TODO: set NEWSLETTER_FROM
  const replyTo = process.env.NEWSLETTER_REPLY_TO || undefined;

  // --- 1. Add the contact (Resend Contacts API) ---
  // A repeat signup of the same email is treated as success.
  const segmentId = process.env.RESEND_SEGMENT_ID;
  try {
    const addRes = await fetch(
      'https://api.resend.com/contacts',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          first_name: firstName || undefined,
          unsubscribed: false,
          segments: segmentId ? [{ id: segmentId }] : undefined,
        }),
      }
    );

    // 200 / 201 are both success. Resend may also return a 200 with an
    // existing contact id - that's fine.
    if (!addRes.ok && addRes.status !== 409 && addRes.status !== 422 /* already exists */) {
      const detail = await addRes.text().catch(() => '');
      console.error('subscribe: resend add-contact failed', {
        status: addRes.status,
        detail: detail.slice(0, 500),
      });
      res.status(502).json({ error: 'resend ' + addRes.status });
      return;
    }
  } catch (e) {
    console.error('subscribe: resend add-contact threw', e && e.message);
    res.status(502).json({ error: 'resend unreachable' });
    return;
  }

  // --- 2. Send the welcome email (best-effort; don't block signup on this) ---
  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: [email],
        subject: WELCOME_SUBJECT,
        html: welcomeHtml(),
        text: welcomeText(),
        reply_to: replyTo,
      }),
    });
    if (!sendRes.ok) {
      // Don't fail the request - the contact is on the list, the welcome
      // email is a nice-to-have. Log so we can diagnose in Vercel logs.
      const detail = await sendRes.text().catch(() => '');
      console.warn('subscribe: welcome send failed', {
        status: sendRes.status,
        detail: detail.slice(0, 500),
      });
    }
  } catch (e) {
    console.warn('subscribe: welcome send threw', e && e.message);
  }

  res.status(200).json({ ok: true });
};
