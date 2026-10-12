# Bangin' & Beats: backend setup guide

Everything that has to be set up outside the code before banginandbeats.com goes live: the domain, email, forms, newsletter, winner emails, tickets, analytics and the Vercel settings. Work top to bottom; later steps depend on earlier ones.

When a step says **"send to developer"**, the value has to go into the code or into Vercel before it works.

---

## 0. Order of operations

1. Domain + DNS access (section 1)
2. Inbox for `info@banginandbeats.com` with ImprovMX (section 2)
3. Formspree form (section 3)
4. Resend newsletter domain + audience (section 4)
5. Brevo winner list + emails (section 5)
6. Ticket event + promo code (section 6)
7. Google Analytics (section 7)
8. Vercel project + environment variables (section 8), then DNS for the website (section 1b)
9. Launch checks (section 9)

---

## 1. Domain and DNS

**Who:** whoever holds the registrar login for `banginandbeats.com`.

- [ ] Log in to the registrar (GoDaddy, Namecheap, Squarespace, Cloudflare, etc.) and find **DNS / Manage DNS** for `banginandbeats.com`.
- [ ] Make sure there is **no existing email forwarding or "parked page"** that adds its own MX or A records. Delete them before adding the records below.
- [ ] Keep `takemebackbingo.com` on **auto-renew**; it will redirect to the new site after launch.

### 1a. Full DNS record list (for reference)

Values marked *(from dashboard)* are generated per account; copy them exactly from that service.

| Type | Host / Name | Value | Priority | Purpose |
|---|---|---|---|---|
| A | `@` | `76.76.21.21` *(confirm in Vercel)* | | Website (bare domain) |
| CNAME | `www` | `cname.vercel-dns.com` *(confirm in Vercel)* | | Website (www) |
| MX | `@` | `mx1.improvmx.com` | 10 | Inbox forwarding |
| MX | `@` | `mx2.improvmx.com` | 20 | Inbox forwarding |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | | SPF for the root domain |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` *(from Resend)* | 10 | Resend bounce handling |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` *(from Resend)* | | Resend SPF |
| TXT | `resend._domainkey` | *(long DKIM key from Resend)* | | Resend DKIM |
| TXT | `@` | `brevo-code:…` *(from Brevo)* | | Brevo domain verification |
| CNAME | `brevo1._domainkey` | *(from Brevo)* | | Brevo DKIM |
| CNAME | `brevo2._domainkey` | *(from Brevo)* | | Brevo DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@banginandbeats.com` | | DMARC (start at `p=none`) |
| TXT | `@` | `google-site-verification=…` *(from Search Console)* | | Search Console (at launch) |

**Rules that trip people up:**
- Only **one SPF record** (`v=spf1 …`) may exist at `@`. If the registrar already has one, merge the `include:` parts into a single record rather than adding a second.
- Resend uses the `send` subdomain, so its SPF/MX do **not** conflict with ImprovMX at `@`.
- Some registrars want the host as `@`, others as blank or `banginandbeats.com`. For subdomains, enter only the part before the domain (`send`, `resend._domainkey`, `_dmarc`).

### 1b. Website DNS (do this in section 8, after the Vercel project exists)
- [ ] In Vercel → Project → Settings → Domains, add `www.banginandbeats.com` (primary) and `banginandbeats.com` (redirect to www). Copy the exact A/CNAME values Vercel shows into DNS.

---

## 2. Inbox: `info@banginandbeats.com` (ImprovMX)

ImprovMX forwards mail sent to `info@banginandbeats.com` into the owner's existing inbox (e.g. Gmail). The free plan covers this.

- [ ] Create an account at improvmx.com (owner's email).
- [ ] Add the domain `banginandbeats.com`.
- [ ] Alias: `info` → owner's real inbox. Optional: a catch-all `*` → same inbox so `hello@`, `bookings@` etc. also arrive.
- [ ] Add the two **MX** records and the **SPF TXT** from the table above. Wait for ImprovMX to show the domain as **Active** (minutes to a few hours).
- [ ] Test: from a different email account, send a message to `info@banginandbeats.com` and confirm it arrives.
- [ ] Optional: to **reply as** `info@banginandbeats.com` from Gmail, use ImprovMX's SMTP credentials (paid plan) in Gmail → Settings → Accounts → "Send mail as". Without it, replies come from the owner's personal address.

**Why it matters:** Formspree notifications, Resend replies, and the address printed on every page all point at `info@banginandbeats.com`.

---

## 3. Contact + booking forms (Formspree)

Every form on the site still posts to Formspree form **`mbdbggbv`**, the old Take Me Back form. Until this changes, booking leads go to whoever owns that form.

Forms that use it:
- the contact / private-party pop-up on Home, Tour Dates and Gallery (also used by "Book a Private Party" and the footer contact links)
- the "Tell us your city" boxes on the Play page (win screen and sticky bar)

Pick one:

**Option A: keep `mbdbggbv`** (only if the owner's Formspree account owns it)
- [ ] In Formspree, open that form → Settings → change the **notification email** to `info@banginandbeats.com`.
- [ ] Settings → **Restrict to domain**: add `banginandbeats.com` and `www.banginandbeats.com`.
- [ ] Tell the developer "keep mbdbggbv" so the test that blocks it is removed.

**Option B: new form** (recommended for a clean break)
- [ ] Create a Formspree account in the owner's name (or use the existing one).
- [ ] New form: **"Bangin & Beats Contact"**, notification email `info@banginandbeats.com`.
- [ ] Settings → Restrict to domain: `banginandbeats.com`, `www.banginandbeats.com`.
- [ ] Turn on spam filtering (Formspree's built-in; reCAPTCHA optional).
- [ ] **Send to developer:** the form ID (the part after `/f/` in `https://formspree.io/f/xxxxxxxx`).

After the swap:
- [ ] Submit a test from the home page pop-up and from the Play page city box; confirm both reach `info@banginandbeats.com`. Emails arrive with subjects like `[Bangin' & Beats] Inquiry`.

Free-plan note: Formspree's free tier caps monthly submissions; upgrade if booking volume is high.

---

## 4. Newsletter (Resend)

The footer email box adds people to Resend **Contacts** and sends a branded welcome email ("You're locked in: Bangin' & Beats™").

- [ ] Create or log in to resend.com (owner's account).
- [ ] **Domains → Add Domain** → `banginandbeats.com`, region **us-east-1**. Add the `send` MX, `send` SPF TXT and `resend._domainkey` DKIM records it shows. Wait for **Verified**.
- [ ] No audience to create: Resend replaced Audiences with **Contacts** (plus optional Segments) in Nov 2025, and the site adds signups straight to Contacts. Optional: **Contacts → Segments → create** "Newsletter" and use its ID as `RESEND_SEGMENT_ID` to keep website signups grouped.
- [ ] **API Keys → Create** with **Full access** (the contacts endpoint needs it; a "sending only" key fails).
- [ ] **Send to developer / put in Vercel:**

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | the new key (`re_…`) |
| `RESEND_SEGMENT_ID` | optional: a segment ID, or leave unset |
| `NEWSLETTER_FROM` | `Bangin' & Beats <hello@banginandbeats.com>` |
| `NEWSLETTER_REPLY_TO` | `info@banginandbeats.com` |

`hello@` does not need a real inbox; replies go to `info@` (ImprovMX).
- [ ] Test after deploy: subscribe a test address on the live site; the welcome email should land in the inbox (not spam) and the address should appear under Contacts.
- [ ] Old subscribers: if the owner wants to keep the Take Me Back list, export it from the old Resend account and import it into the new Contacts (only people who opted in).

---

## 5. Winner emails (Brevo)

When someone wins THE BEAT BOARD™ online and types their email under the THROWBACK10 code, the site adds them to a **Brevo contact list**. An **automation inside Brevo** then emails the code at about 24 and 47 hours. The site only adds the contact; the emails live in Brevo.

- [ ] Decide the list:
  - **Keep list #3** (current default). Simplest; old and new winners share it.
  - **New list** "Bangin & Beats Winners" (recommended). Note its **list ID** (Contacts → Lists, the number in the URL/ID column) and copy the 24h/47h automation onto it.
- [ ] **Edit the automation emails** (Automations → the THROWBACK10 workflow → each email):
  - "Take Me Back Bingo" → "Bangin' & Beats™", new logo, black `#0A0A0A` + gold `#D4AF37`
  - the old SimpleTix link → the new ticket link (section 6)
  - the code, if it changes from THROWBACK10
  - sender: `Bangin' & Beats <info@banginandbeats.com>` (or `hello@`)
- [ ] **Senders & IP → Domains → Authenticate** `banginandbeats.com`: add the `brevo-code` TXT and the two DKIM CNAMEs it shows, plus the DMARC record from section 1a. Without this, Brevo emails "from" the new domain land in spam.
- [ ] Contact attribute `FIRSTNAME` must exist (it does by default); the site fills it.
- [ ] **API key:** SMTP & API → API Keys → create (or reuse) a v3 key.
- [ ] **Send to developer / put in Vercel:** `BREVO_API_KEY`, and `BREVO_WINNERS_LIST_ID` (only if not 3).
- [ ] Test after deploy: win a round on `/play`, enter a test email; it appears in the list and the first automation email arrives on schedule.

---

## 6. Tickets + the 10% code

The home page ribbon now says **"Next stop: Woodbridge, NJ · The All-Black Throwback Experience · 3:00–9:00 PM"**, but there is no date or ticket link yet, so every "Buy Tickets" button points at the Tour Dates page.

- [ ] Create the event on the ticket platform (SimpleTix, Eventbrite, Posh…) under the **Bangin' & Beats** name (not Take Me Back Bingo).
- [ ] Create the **10% promo code** on that event: keep `THROWBACK10` or choose a new one. Whatever it is must match the Play-page win screen and the Brevo emails.
- [ ] Rename or close out any old "Take Me Back Bingo" listings still for sale.
- [ ] **Send to developer:** the event **date**, the **ticket link**, ticket tiers/prices, DJ and host names, the dress code (is "All-Black" a dress code?), and a flyer **without** the old logo. The developer adds it to Tour Dates, points every ticket button at checkout (with `?promo=CODE` on the win screen) and adds event data for Google.
- [ ] After that, new dates can be added through `/admin/events` (needs section 8's `GH_TOKEN`).

---

## 7. Google Analytics

Every page still sends visits to the **old Take Me Back Bingo** Google Analytics properties (`G-L8RFG2GF44` and `G-J9NHGQTQ5F`), so new traffic would mix into the old reports.

- [ ] In Google Analytics, create a new **GA4 property** "Bangin & Beats" with a web data stream for `https://www.banginandbeats.com`.
- [ ] **Send to developer:** the new Measurement ID (`G-…`). The developer swaps it into all 25 pages.
- [ ] Optional: mark `newsletter_signup` and `bingo_win` as **key events** (the site already fires both).
- [ ] At launch, also update the old property's stream URL or leave it to record the redirects.

---

## 8. Vercel (hosting) + environment variables

- [ ] vercel.com → Add New → Project → import GitHub repo **`robertvanliew/bangin-and-beats`**. Framework: **Other**, no build command, output directory `.`.
- [ ] Settings → Environment Variables (Production **and** Preview):

| Variable | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | from section 4 | |
| `RESEND_SEGMENT_ID` | from section 4 | optional |
| `NEWSLETTER_FROM` | `Bangin' & Beats <hello@banginandbeats.com>` | |
| `NEWSLETTER_REPLY_TO` | `info@banginandbeats.com` | |
| `BREVO_API_KEY` | from section 5 | |
| `BREVO_WINNERS_LIST_ID` | from section 5 | omit to use list 3 |
| `ADMIN_PASSWORD` | `banginbeats2026` | **must match** the admin page password, which sends it to the server when publishing. Ask the developer to change both together if you want a different one. |
| `GH_TOKEN` | GitHub fine-grained token | GitHub → Settings → Developer settings → Fine-grained tokens → repo **bangin-and-beats** only → Permissions: **Contents: Read and write**. Set an expiry and a calendar reminder to renew it. |
| `GH_OWNER` | `robertvanliew` | |
| `GH_REPO` | `bangin-and-beats` | |
| `GH_BRANCH` | `main` | |
| `GH_PATH` | `content/events.json` | |

- [ ] Do **not** reuse the old project's tokens or audience/list IDs unless you deliberately chose to keep them above.
- [ ] Deploy, then add the domains (section 1b).
- [ ] The site ships with a **pre-launch `noindex`** header so Google ignores it until launch; the developer removes it on launch day.

---

## 9. Launch checks (before announcing)

- [ ] `https://banginandbeats.com` redirects to `https://www.banginandbeats.com`; padlock (SSL) is valid.
- [ ] Contact pop-up, Play-page city box, newsletter and winner email all tested on the live site (sections 3–5).
- [ ] `/admin` login → add a test event → publish → it appears on Tour Dates within about a minute → delete it.
- [ ] Real **iPhone (Safari)** and **Android (Chrome)** check of Home, Play, Tour Dates, Gallery and one blog post.
- [ ] Google Search Console: add the new domain property (DNS TXT), submit `https://www.banginandbeats.com/sitemap.xml`; at launch use **Change of address** from the old property.
- [ ] Old site: on launch day the developer turns `takemebackbingo.com` into 301 redirects to the matching new pages.

---

## 10. Easy to forget

- [ ] **Instagram / TikTok:** confirm `@banginandbeats` exists on both (the site links to them); update bios to `banginandbeats.com`.
- [ ] **Facebook page:** send the URL if there is one (the old one was removed from the site).
- [ ] **Google Business Profile:** new name, website, phone `201-344-4589`.
- [ ] **Directories / listings** (Yelp, Eventbrite organizer page, venue pages) pointing at the old name or site.
- [ ] **Email signatures, flyers, QR codes** printed with `takemebackbingo.com` (they keep working via redirects, but update for new prints). The admin card printer already uses `banginandbeats.com`.
- [ ] **Attorney:** the "$12,000 revenue" claim in the planning blog post, and the Legal page (operator line, 30 & Up).
- [ ] **Owner approvals:** home FAQ answers and the 11 landing pages (see `docs/owner-todo.md`).
- [ ] Optional: a recorded "THAT'S BANGIN'!" MP3 for the game's win screen; a horizontal party clip for a sharper hero video.

---

## What to send the developer (summary)

1. Formspree: "keep mbdbggbv" **or** the new form ID
2. Resend: API key (+ optional segment ID)
3. Brevo: API key (+ list ID if new) and confirmation the automation emails are rebranded
4. Ticketing: event date, ticket link, promo code, DJ/host, dress code, clean flyer
5. Google Analytics: new GA4 Measurement ID
6. GitHub: fine-grained token for `GH_TOKEN` (or add it in Vercel directly)
7. Social links: Instagram, TikTok, Facebook (if any)
