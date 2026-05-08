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

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Three Things to Change Before Going Live

1. **Founder photos** — Add `jashwanth.jpg` to `public/team/` and update the Team section to use `<Image>` with that path instead of the monogram placeholder.

2. **Second founder card** — Search for `TODO` comments in `src/components/sections/Team.tsx` and fill in co-founder name, role, bio, photo, and LinkedIn URL.

3. **Contact form backend** — The form currently uses `mailto:321tair@gmail.com`. For production, consider replacing with a form service (Formspree, Resend) or a Next.js API route.

## Deployment

```bash
npm run build   # Validate production build
npx vercel      # Deploy to Vercel
```

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
