# TAIR Website — Deployment checklist

Follow these steps in order. Steps marked **(you)** require your browser/login.

---

## Environment variables

Add these in **two places**: local `.env.local` (done) and **Vercel → Project → Settings → Environment Variables**.

| Variable | Value | Notes |
|----------|--------|--------|
| `RESEND_API_KEY` | Your Resend key | Never commit to git |
| `CONTACT_EMAIL_TO` | `321tair@gmail.com` | Where inquiries land |
| `CONTACT_EMAIL_FROM` | `TAIR Website <onboarding@resend.dev>` | Change after domain verified in Resend |

---

## Step 1 — Test locally **(you)**

```bash
cd TAIR_Website
npm run dev
```

1. Open http://localhost:3000 — home page should match production layout.
2. Open http://localhost:3000/contact — submit a test message.
3. Check `321tair@gmail.com` for the email.

---

## Step 2 — Push code to GitHub **(you or ask agent)**

```bash
cd TAIR_Website
git add -A
git commit -m "Add product pages, contact API, keep production home layout"
git push origin main
```

---

## Step 3 — Create Vercel project **(you)**

1. Go to https://vercel.com/new
2. Import `Jbamidi/TAIR_Website` from GitHub.
3. Framework: **Next.js** (auto-detected).
4. Add the three env vars above (Production + Preview).
5. Click **Deploy**.

Note the deployment URL (e.g. `tair-website.vercel.app`).

---

## Step 4 — Add custom domain **(you)**

In Vercel → Project → **Settings → Domains**:

1. Add `tairsystems.com` and `www.tairsystems.com`.
2. Vercel shows DNS records to add.

In **Cloudflare** (DNS for tairsystems.com):

1. Remove or update old **GitHub Pages** records.
2. Add Vercel’s records (usually `A` `76.76.21.21` for apex, `CNAME` `cname.vercel-dns.com` for www — use exactly what Vercel shows).
3. SSL/TLS mode: **Full** recommended.

Wait 5–30 minutes for DNS propagation.

---

## Step 5 — Disable GitHub Pages **(you)**

GitHub → `TAIR_Website` → **Settings → Pages** → set source to **None**, or leave disabled so only Vercel serves the site.

The repo’s GitHub Action now only runs `npm run build` (CI), not Pages deploy.

---

## Step 6 — Verify production **(you)**

- https://tairsystems.com — home unchanged
- https://tairsystems.com/products — product catalog
- https://tairsystems.com/contact — form works
- Submit one real test inquiry

---

## Optional — Resend custom domain

1. Resend dashboard → **Domains** → Add `tairsystems.com`
2. Add DNS records Resend provides in Cloudflare
3. Update Vercel env: `CONTACT_EMAIL_FROM=TAIR Website <contact@tairsystems.com>`

---

## Security

If your Resend API key was shared in chat or docs, **rotate it** at https://resend.com/api-keys after deploy and update Vercel + `.env.local`.
