# Bangin' & Beats: switch-over to-do list

Things to change or confirm outside the code (or that need an owner decision) before and after launch. Tick each box when it's done. The implementation plan is `docs/2026-10-12-bangin-and-beats-rebrand.md`.

## 1. Forms (Formspree): contact, private-party booking, city requests

Every form on the site still posts to Formspree form `mbdbggbv`, the old site's form.

- [ ] Decide which way to go:
  - **Keep the old form** (only if the owner's account owns `mbdbggbv`): in Formspree, set its notification email to `info@banginandbeats.com` and add `banginandbeats.com` and `www.banginandbeats.com` to the allowed domains. Tell the developer so the test that blocks the old ID can be removed.
  - **New form**: create "Bangin & Beats Contact" in the owner's Formspree account (notification email `info@banginandbeats.com`) and send the developer the new form ID (the part after `/f/` in the form URL).
- [ ] After the swap, submit a test from the home page contact form, a private-party request, and the play-page "tell us your city" box. Confirm each one reaches `info@banginandbeats.com`.

## 2. Winner emails (Brevo): the THROWBACK10 follow-ups

When a game winner types their email under the code, the site adds them to a Brevo contact list (list #3 by default). An automation built inside Brevo then emails the code at about 24 and 47 hours. The emails live in Brevo, not in the website code.

- [ ] Decide: **keep list #3** (simplest; old and new winners share a list) or **make a new "Bangin & Beats Winners" list** and send the developer its list number (it becomes `BREVO_WINNERS_LIST_ID` in Vercel).
- [ ] In Brevo, edit the automation emails: replace "Take Me Back Bingo" with "Bangin' & Beats", update the logo and colors (black `#0A0A0A`, gold `#D4AF37`), and replace the old SimpleTix link with the new ticket link.
- [ ] If a new list is used, copy the 24h/47h automation onto it.

## 3. The 10% discount code

The game's win screen shows **THROWBACK10** and **$35 → $31.50**, and the button goes to `/events`.

- [ ] Decide: keep **THROWBACK10** or switch to a new code (for example `BANGIN10`). If switching, send the developer the new code; the win screen, the Brevo emails, and the ticket platform must all use the same one.
- [ ] Create the code (10% off) on the new Bangin' & Beats event on the ticket platform (SimpleTix or wherever tickets are sold).
- [ ] Send the developer the new event's ticket link; the win button will point at it with `?promo=<CODE>` on the end.
- [ ] The old Summer Jam SimpleTix event (`take-me-back-bingo-summer-jam-tickets-278482`) has passed and has the old name; don't link to it again.

## 4. Newsletter (Resend)

- [ ] In Resend, add and verify the domain `banginandbeats.com` (SPF/DKIM records at the registrar).
- [ ] Create a new "Bangin & Beats" audience and send the developer its ID (`RESEND_AUDIENCE_ID`).
- [ ] Sending address will be `Bangin' & Beats <hello@banginandbeats.com>`, replies to `info@banginandbeats.com`.

## 5. Email inbox

- [x] Set up `info@banginandbeats.com` (done 2026-10-12: ImprovMX active, aliases *, info, sha, tickets → banginandbeats@gmail.com; forwarding to the owner's existing inbox is fine: registrar forwarding, Cloudflare Email Routing, or ImprovMX).

## 6. Social accounts

- [ ] Confirm Instagram `@banginandbeats` exists and send the URL.
- [ ] Confirm TikTok `@banginandbeats` exists and send the URL.
- [ ] Facebook: the old page link was removed from the site. Send a new page URL if there is one.

## 7. Photos, videos and flyers with the old brand printed in them

- [ ] Hero video: the sizzle reel has "THRILLER BINGO" in every frame, so the home page shows a still photo for now. Send a clean re-edit (no old logo, no "Thriller Bingo" backdrop) to bring the video back.
- [ ] Event flyers: every flyer in `flyers/` says "TAKE ME BACK BINGO". New flyers are needed for future events (they upload through the admin Events page).
- [ ] Gallery: a few photos still show the old printed song cards or the "Thriller Bingo" backdrop at small size. Decide whether to swap them for newer photos.
- [ ] Optional: a recorded "THAT'S BANGIN'!" shout (MP3) for the win celebration. Until then it's silent.
- [ ] Unused old-brand files are still in the repo (`flyers/`, `Video/`, `photos/hero-poster*.jpg`). Decide whether to delete them.

## 8. Copy approvals

- [ ] The 14 home-page FAQ answers (drafted from the owner's facts).
- [ ] The 11 landing pages (How It Works, Hip-Hop, R&B, Sunday Day Party, Woodbridge, Newark, Edison, NYC, Bachelorette, Birthday, Fundraiser). Unverified claims were removed ("every night sells out", NYC price ranges, set door times); some new copy was written.
- [ ] Blog: "generations of cars" was changed to "ears"; "the club feels earned" was kept as written.
- [ ] Attorney: the `$12,000 revenue injection` claim in the planning blog post.
- [ ] Attorney: the Legal page (operator line added; public age changed from 21 to 30 & Up).

## 9. Admin tools

- [ ] The admin pages' soft password is now `banginbeats2026` (visible in the page source; it only keeps casual visitors out). Set a new `ADMIN_PASSWORD` in Vercel; that is what actually protects publishing.

## 10. Launch day and after (plan Tasks 11 and 12)

- [ ] Registrar login for `banginandbeats.com` (or the owner adds the DNS records the developer sends).
- [ ] Real iPhone and Android check before sign-off.
- [ ] Google Business Profile, Instagram/TikTok bio links, ticket platform event names, Facebook, Google Analytics stream URL, directory listings.
- [ ] Keep `takemebackbingo.com` on auto-renew so the redirects keep working.
