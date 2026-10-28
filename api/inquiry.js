// Vercel serverless function - booking / contact inquiries (the pop-up form).
//
// Same-origin POST from inquiry.js. CommonJS, global fetch (Node 18+), no SDK.
//
// What it does:
//   1. Validates the inquiry (and silently drops honeypot bots)
//   2. Emails a branded "New lead" notification to the inbox (reply-to = the lead)
//   3. Emails the lead a branded "We got your request" confirmation
//   4. If Resend can't send the notification, forwards the inquiry to the
//      owner's Formspree form instead, so a lead is never lost
//
// Env vars (Vercel):
//   RESEND_API_KEY    required for the branded emails (already used by /api/subscribe)
//   INQUIRY_FROM      optional, e.g. "Bangin' & Beats <bookings@banginandbeats.com>"
//                     (defaults to NEWSLETTER_FROM, then hello@banginandbeats.com)
//   INQUIRY_TO        optional, comma-separated inbox list (default info@banginandbeats.com)
//   FORMSPREE_FORM_ID optional fallback form (default xzedaygd)

const SITE = 'https://www.banginandbeats.com';
const LOGO = SITE + '/logos/bangin-beats-logo-480.png';
const HOTLINE = '201-344-4589';
const HOTLINE_TEL = '+12013444589';
const IG = 'https://www.instagram.com/banginandbeats';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 254, phone: 40, topic: 80, message: 5000, eventDate: 20, city: 120, headcount: 10, context: 300, page: 200 };

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

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// "2027-02-20" -> "Saturday, February 20, 2027"
function prettyDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function prettyPhone(p) {
  const d = String(p || '').replace(/\D/g, '');
  const ten = d.length === 11 && d[0] === '1' ? d.slice(1) : d;
  return ten.length === 10 ? `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}` : p;
}
const telHref = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
// Form values read like "Private booking - Fundraiser"; emails show "Private Party: Fundraiser".
const topicLabel = (t) => String(t || 'General inquiry').replace(/^Private booking\s*-\s*/i, 'Private Party: ');

// ---------- shared email chrome ----------
// Table-based, inline styles, web-safe fonts: renders the same in Gmail,
// Outlook and Apple Mail. Logo is the hosted PNG (no attachments).
function shell({ preheader, body, dark }) {
  const bg = dark ? '#0A0A0A' : '#F4F1EA';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="${dark ? 'dark' : 'light'}"><title>Bangin' &amp; Beats</title></head>
<body style="margin:0;padding:0;background:${bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${bg};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
${body}
</table></td></tr></table></body></html>`;
}

const HEADER = (eyebrow, title, sub) => `
<tr><td style="background:#0A0A0A;border-radius:14px 14px 0 0;padding:26px 32px 22px;border:1px solid #2a2418;border-bottom:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;"><img src="${LOGO}" width="128" alt="Bangin' &amp; Beats" style="display:block;width:128px;height:auto;border:0;"></td>
    <td align="right" style="vertical-align:middle;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#D4AF37;font-weight:700;">${esc(eyebrow)}</td>
  </tr></table>
  <h1 style="margin:22px 0 0;font-family:'Arial Black',Helvetica,Arial,sans-serif;font-size:26px;line-height:1.15;color:#FFF8E7;text-transform:uppercase;letter-spacing:.01em;">${title}</h1>
  ${sub ? `<p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#B9AF99;">${sub}</p>` : ''}
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:#D4AF37;background-image:linear-gradient(90deg,#7A5A14,#E2C15A,#FFF1BE,#D4AF37,#8C6A1C);">&nbsp;</td></tr>`;

const row = (label, valueHtml) => valueHtml ? `
<tr><td style="padding:12px 0;border-top:1px solid #ECE5D3;width:132px;vertical-align:top;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8A7F68;font-weight:700;">${label}</td>
<td style="padding:12px 0;border-top:1px solid #ECE5D3;vertical-align:top;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#141414;">${valueHtml}</td></tr>` : '';

const button = (href, label, primary = true) => `<a href="${href}" style="display:inline-block;background:${primary ? '#D4AF37' : 'transparent'};color:${primary ? '#0A0A0A' : '#D4AF37'};border:2px solid #D4AF37;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;padding:13px 24px;border-radius:999px;margin:0 8px 10px 0;">${label}</a>`;

// ---------- 1. notification to the inbox ----------
function notificationHtml(d) {
  const first = esc(safeFirst(d.name) || 'them');
  const pageUrl = d.page ? SITE + d.page : SITE;
  const isBooking = /^private booking/i.test(d.topic);
  const body = `
${HEADER(isBooking ? 'New booking lead' : 'New inquiry', esc(topicLabel(d.topic)), `${esc(d.name)} reached out through banginandbeats.com`)}
<tr><td style="background:#FFFFFF;padding:8px 32px 28px;border:1px solid #E6DCC4;border-top:0;border-radius:0 0 14px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
    ${row('Name', `<strong>${esc(d.name)}</strong>`)}
    ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#7A5E12;text-decoration:none;font-weight:700;">${esc(d.email)}</a>`)}
    ${row('Phone', d.phone ? `<a href="${telHref(d.phone)}" style="color:#7A5E12;text-decoration:none;font-weight:700;">${esc(prettyPhone(d.phone))}</a>` : '')}
    ${row('Inquiry', esc(topicLabel(d.topic)))}
    ${row('Event date', d.eventDate ? `<strong>${esc(prettyDate(d.eventDate))}</strong>` : '')}
    ${row('Location', esc(d.city))}
    ${row('Headcount', d.headcount ? esc(d.headcount) + ' guests' : '')}
    ${row('Re', esc(d.context))}
    ${row('Message', esc(d.message).replace(/\n/g, '<br>'))}
    ${row('From page', `<a href="${esc(pageUrl)}" style="color:#7A5E12;text-decoration:none;">${esc(d.page || '/')}</a>`)}
  </table>
  <div style="margin-top:24px;padding-top:20px;border-top:1px solid #ECE5D3;">
    ${button(`mailto:${esc(d.email)}?subject=${encodeURIComponent("Re: your Bangin' & Beats inquiry")}`, `Reply to ${first}`)}
    ${d.phone ? button(telHref(d.phone), `Call ${first}`, false) : ''}
  </div>
  <p style="margin:18px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#8A7F68;">${first} has been sent a confirmation email. Hitting reply on this email goes straight to ${first}.</p>
</td></tr>
<tr><td align="center" style="padding:18px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9A917D;">Bangin' &amp; Beats&trade; &middot; High Class Experience LLC</td></tr>`;
  return shell({ preheader: `${d.name} · ${topicLabel(d.topic)}${d.eventDate ? ' · ' + prettyDate(d.eventDate) : ''}`, body, dark: false });
}

// ---------- 2. confirmation to the lead ----------
function confirmationHtml(d) {
  const first = esc(safeFirst(d.name) || 'there');
  const summary = [
    ['Request', esc(topicLabel(d.topic))],
    ['Date', d.eventDate ? esc(prettyDate(d.eventDate)) : ''],
    ['Location', esc(d.city)],
    ['Guests', esc(d.headcount)],
  ].filter((r) => r[1]).map(([k, v]) => `
<tr><td style="padding:10px 0;border-top:1px solid #2a2418;width:110px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9C8F72;font-weight:700;">${k}</td>
<td style="padding:10px 0;border-top:1px solid #2a2418;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#FFF8E7;">${v}</td></tr>`).join('');
  const body = `
${HEADER('Request received', `You&rsquo;re on our radar, ${first}.`, 'Thanks for reaching out to Bangin&rsquo; &amp; Beats&trade;.')}
<tr><td style="background:#121212;padding:26px 32px 30px;border:1px solid #2a2418;border-top:0;border-radius:0 0 14px 14px;">
  <p style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#E6DECB;">Your message is in. Our team reads every request personally and will get back to you within one business day, usually sooner.</p>
  ${summary ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 22px;">${summary}</table>` : ''}
  <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#D4AF37;font-weight:700;">What happens next</p>
  <p style="margin:0 0 22px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#C9BFA8;">We&rsquo;ll confirm the date, talk through your crowd&rsquo;s favorite era and send a quote. A 50% deposit locks in your night.</p>
  <div>
    ${button(`${SITE}/events`, 'See tour dates')}
    ${button(IG, 'Follow @banginandbeats', false)}
  </div>
  <p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#B9AF99;">Need us sooner? Call or text <a href="tel:${HOTLINE_TEL}" style="color:#D4AF37;text-decoration:none;font-weight:700;">${HOTLINE}</a>, or just reply to this email.</p>
</td></tr>
<tr><td align="center" style="padding:20px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#7E7564;">
  Bangin' &amp; Beats&trade; &middot; The ultimate 90s &amp; 2000s hip-hop &amp; R&amp;B interactive throwback party<br>
  <a href="${SITE}" style="color:#9C8F72;text-decoration:none;">banginandbeats.com</a> &middot; NY / NJ &middot; Strictly 30 &amp; Up<br>
  You&rsquo;re receiving this because you sent an inquiry on our website.
</td></tr>`;
  return shell({ preheader: `We got your request. We'll reply within one business day.`, body, dark: true });
}

function plainText(d, forLead) {
  const opt = (v, line) => (v ? line : null); // optional line; dropped when empty
  const lines = forLead
    ? [`Hi ${d.name.split(/\s+/)[0]},`, '', "Thanks for reaching out to Bangin' & Beats. Your message is in, and we'll get back to you within one business day.",
       '', `Request: ${topicLabel(d.topic)}`, opt(d.eventDate, `Date: ${prettyDate(d.eventDate)}`), opt(d.city, `Location: ${d.city}`), opt(d.headcount, `Guests: ${d.headcount}`),
       '', `Need us sooner? Call or text ${HOTLINE}, or reply to this email.`, '', SITE]
    : [`New inquiry: ${topicLabel(d.topic)}`, '', `Name: ${d.name}`, `Email: ${d.email}`, opt(d.phone, `Phone: ${d.phone}`), opt(d.eventDate, `Event date: ${prettyDate(d.eventDate)}`),
       opt(d.city, `Location: ${d.city}`), opt(d.headcount, `Headcount: ${d.headcount}`), opt(d.context, `Re: ${d.context}`), '', d.message, '', `From page: ${SITE}${d.page || '/'}`];
  return lines.filter((l) => l !== null).join('\n');
}

async function resendSend(apiKey, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function formspreeFallback(d) {
  const id = process.env.FORMSPREE_FORM_ID || 'xzedaygd';
  const r = await fetch(`https://formspree.io/f/${id}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Origin: SITE, Referer: SITE + (d.page || '/') },
    body: JSON.stringify({ ...d, _subject: `[Bangin' & Beats] ${d.topic}` }),
  });
  if (!r.ok) throw new Error('formspree ' + r.status);
}

// ---------- spam guard ----------
// Bots stuff scam links into short fields (name, city) so our confirmation
// email carries them to a victim. Anything that looks like that is dropped
// silently (200, no emails) so the bot learns nothing.
const URL_RE = /(https?:\/\/|www\.|\.[a-z]{2,}\/)/i;
const MIN_FILL_MS = 2500; // a person can't open, fill and send the form faster
function spamReason(d, b) {
  const t = Number(b._t);
  if (!Number.isFinite(t) || t < MIN_FILL_MS) return 'too_fast_or_scripted';
  if ([d.name, d.city, d.phone, d.topic, d.headcount].some((v) => URL_RE.test(v))) return 'link_in_short_field';
  if (/@/.test(d.name) || d.name.length > 80 || !/\p{L}/u.test(d.name)) return 'bad_name';
  if (d.phone && !/^\+?[\d\s().-]{7,20}$/.test(d.phone)) return 'bad_phone';
  if (d.eventDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (d.eventDate < today) return 'past_event_date';
  }
  if ((d.message.match(/https?:\/\//gi) || []).length > 2) return 'link_spam';
  // Random-token gibberish ("JhqZozD S4j2FfJ hCgnsSY"): most words flip case mid-word or mix digits.
  const words = d.message.split(/\s+/).filter((w) => w.length >= 4);
  const odd = words.filter((w) => /[a-z][A-Z]|[A-Za-z]\d|\d[A-Za-z]/.test(w)).length;
  if (words.length >= 3 && odd / words.length >= 0.5) return 'gibberish';
  return '';
}
// Only letters (any language), apostrophes and hyphens make it into the greeting.
const safeFirst = (name) => ((String(name).split(/\s+/)[0] || '').match(/[\p{L}'’-]+/u) || [''])[0].slice(0, 30);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method not allowed' }); }
  const b = await readBody(req);

  // Bots fill the hidden field; tell them it worked and do nothing.
  if (typeof b._gotcha === 'string' && b._gotcha.trim()) return res.status(200).json({ ok: true });

  const d = {
    name: clean(b.name, MAX.name),
    email: clean(b.email, MAX.email),
    phone: clean(b.phone, MAX.phone),
    topic: clean(b.topic, MAX.topic) || 'General inquiry',
    eventDate: clean(b.eventDate, MAX.eventDate),
    city: clean(b.city, MAX.city),
    headcount: clean(String(b.headcount || ''), MAX.headcount),
    message: clean(b.message, MAX.message),
    context: clean(b.context, MAX.context),
    page: clean(b.page, MAX.page).replace(/[^\w\-/.]/g, ''),
  };
  if (!d.name || !d.message) return res.status(400).json({ error: 'name and message are required' });
  if (!EMAIL_RE.test(d.email)) return res.status(400).json({ error: 'invalid email' });
  const spam = spamReason(d, b);
  if (spam) { console.warn('inquiry: dropped as spam', spam); return res.status(200).json({ ok: true }); }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM || process.env.NEWSLETTER_FROM || "Bangin' & Beats <hello@banginandbeats.com>";
  const to = (process.env.INQUIRY_TO || 'info@banginandbeats.com').split(',').map((s) => s.trim()).filter(Boolean);
  const first = safeFirst(d.name) || 'there';

  let notified = false;
  if (apiKey) {
    try {
      await resendSend(apiKey, {
        from, to, reply_to: d.email,
        subject: `New lead: ${topicLabel(d.topic)} · ${d.name}${d.eventDate ? ' · ' + prettyDate(d.eventDate) : ''}`,
        html: notificationHtml(d), text: plainText(d, false),
      });
      notified = true;
    } catch (e) { console.error('inquiry: notification failed', e.message); }
  } else {
    console.error('inquiry: missing RESEND_API_KEY, using Formspree fallback');
  }

  if (!notified) {
    try { await formspreeFallback(d); }
    catch (e) { console.error('inquiry: fallback failed', e.message); return res.status(502).json({ error: 'could not send' }); }
    return res.status(200).json({ ok: true, confirmation: false });
  }

  // Confirmation is best-effort: the lead already reached the inbox.
  let confirmed = false;
  try {
    await resendSend(apiKey, {
      from, to: [d.email], reply_to: to[0],
      subject: `We got your request, ${first} | Bangin' & Beats`,
      html: confirmationHtml(d), text: plainText(d, true),
    });
    confirmed = true;
  } catch (e) { console.error('inquiry: confirmation failed', e.message); }

  return res.status(200).json({ ok: true, confirmation: confirmed });
};

// Exposed for the local preview script (tests render these to check the design).
module.exports.notificationHtml = notificationHtml;
module.exports.confirmationHtml = confirmationHtml;
