# Bangin' & Beats™ website

The rebrand of the Take Me Back Bingo site for **banginandbeats.com**. The owner (High Class Experience LLC) is moving off the "Bingo" name for trademark reasons. This repo started as a copy of the TMBB site and is being reworked page by page.

## Start here

1. Read `docs/2026-10-12-bangin-and-beats-rebrand.md`, the implementation plan. Its **Status** line at the top says where to resume. Work the tasks in order and tick each `- [ ]` box as you finish it.
2. The owner's exact wording is in `docs/spec-owner-copy.md`. Copy marked verbatim in the plan must match it word for word.
3. Run `npm test` before and after every task. A task is done when its suite passes.

## Rules

- **Commit and push to `main` at the end of every task.** Vercel auto-deploys. Don't leave local drafts.
- **Don't touch `C:\Users\12124\Documents\Take-me-back-bingo`** (the live old site) until plan Task 12, launch day. It's still earning traffic.
- **No visible "bingo" or "Take Me Back"** in page text, titles, meta and OG tags, alt text, aria-labels, JSON-LD, URLs, emails, or the printable cards. The test suite enforces this. Internal CSS and JS names like `#bingoGrid` may stay.
- **Mobile:** don't call something "fixed" from desktop Chromium alone. iOS Safari breaks on huge images and on `backface-visibility`, so keep served images ≤ 1600px and ≤ 400 KB, and do a real iPhone check before sign-off.
- Keep the existing layout and design system. This is a re-skin plus new copy, not a redesign. Big mobile CSS overhauls were rejected before; ask before restructuring anything.
- Match the surrounding code style: plain HTML/CSS/vanilla JS, no build step, no frameworks.

## Commands

- `npm test`: every guard suite. `npm test -- raw`, `-- brand`, `-- assets`, `-- home`, `-- play` run one suite.
- `node -e "import('./tests/static-server.mjs').then(m=>m.startServer(4173))"` serves a local preview at http://localhost:4173 (cleanUrls like Vercel).
- `python -I scripts/make-logos.py docs/owner/bangin-beats-logo-source.png` regenerates the logo assets (plan Task 2).

## Brand quick reference

- Palette: black `#0A0A0A`, gold `#D4AF37`, champagne `#C9A86A`, cream `#FFF8E7`, crimson `#8B1A1A`, purple `#7C3AED`.
- Contact: `info@banginandbeats.com` · `201-344-4589` · `@banginandbeats` · `#BanginAndBeats`.
- The game is **THE BEAT BOARD™**: column headers B-E-A-T-S, center square `BANGIN'`, the win shout "THAT'S BANGIN'!", eras 90s Rap / 90s R&B / 2000s Hip-Hop / 2000s Slow Jams.
- Tickets $35 · 30 & Up · © 2026 HIGH CLASS EXPERIENCE LLC.
