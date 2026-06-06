# TAIR Website

Marketing site for TAIR — Autonomous Indoor Intelligence Platform.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (CSS-based config)
- **Framer Motion** (animations)
- **Three.js** + @react-three/fiber + @react-three/drei (3D visualizations)
- **Lucide React** (icons)
- **Geist** (typography — Sans + Mono)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens, color palette, Tailwind theme
│   ├── layout.tsx           # Root layout with Geist fonts + SEO metadata
│   └── page.tsx             # Single-page site composing all sections
├── components/
│   ├── sections/            # Page sections
│   │   ├── Navbar.tsx       # Fixed nav, blur on scroll, mobile hamburger
│   │   ├── Hero.tsx         # Full-viewport hero, typewriter, CTAs
│   │   ├── Problem.tsx      # Animated statistics + problem framing
│   │   ├── HowItWorks.tsx   # 4-step flow with Lucide icons
│   │   ├── Platform.tsx     # Three.js dashboard + terminal log (centerpiece)
│   │   ├── WhyTAIR.tsx      # 3 differentiator cards
│   │   ├── Team.tsx         # Founder cards (1 filled + 1 placeholder)
│   │   ├── Contact.tsx      # mailto: contact form
│   │   ├── Footer.tsx       # Minimal footer with build identifier
│   │   └── index.ts         # Barrel export
│   ├── three/               # Three.js scene components
│   │   ├── HeroVisualization.tsx   # Top-down warehouse scan animation
│   │   └── DashboardPreview.tsx    # Isometric digital twin with live drone
│   └── ui/                  # Shared UI primitives
│       ├── Button.tsx       # Primary/ghost variants, Framer Motion
│       ├── Card.tsx         # Hover glow card
│       ├── GlowDot.tsx      # Cyan accent dot
│       ├── MonoText.tsx     # Geist Mono wrapper
│       └── index.ts         # Barrel export
├── lib/
│   └── animations.ts        # Reusable Framer Motion variants
public/
└── team/                     # Team photos go here
    └── jashwanth.jpg         # TODO: Add founder photo
```

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing home with cinematic hero and product preview |
| `/products` | Full product catalog |
| `/products/[slug]` | Individual product detail pages |
| `/about` | Company story and team |
| `/contact` | Contact form (submissions via Resend) |

Product data lives in `src/lib/products.ts` — add or edit offerings there. Each product gets its own card (home + `/products`) and detail page at `/products/[slug]` automatically.

Shared UI components for consistent theming:
- `src/components/products/ProductCard.tsx` — card used on home, catalog, and related products
- `src/components/layout/PageHeader.tsx` — page titles across About, Contact, Products
- `src/components/layout/CTABanner.tsx` — demo/contact CTAs at page bottoms

## Contact form setup

The contact form posts to `/api/contact` and sends email via [Resend](https://resend.com).

1. Copy `.env.example` to `.env.local`
2. Add your `RESEND_API_KEY` from https://resend.com/api-keys
3. Set `CONTACT_EMAIL_TO=321tair@gmail.com`
4. Until `tairsystems.com` is verified in Resend, use `onboarding@resend.dev` as the sender

## Run Locally

```bash
npm install
cp .env.example .env.local   # then fill in RESEND_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

GitHub Pages no longer works for this site — it uses server-side API routes for the contact form.

```bash
npm run build   # Validate production build
npx vercel      # Deploy to Vercel
```

In Vercel project settings, add the same env vars from `.env.example`. Point `tairsystems.com` DNS to Vercel (update Cloudflare records).

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0B` | Page canvas |
| Surface | `#111114` | Elevated cards |
| Foreground | `#EDEDED` | Primary text |
| Secondary | `#9A9A9F` | Body text |
| Muted | `#52525A` | Labels, captions |
| Accent | `#00D4FF` | CTAs, data highlights |
| Divider | `#1F1F23` | Section separators |
| Border | `#2A2A2F` | Card/input borders |
