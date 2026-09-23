# Smoky Candle

![Smoky Candle](public/images/hero-desktop.webp)

Showcase storefront for **Smoky Candle**, handcrafted soy candles made in Italy.
Single-page, animated, in Italian, with a catalog, gift sets and a client-side
cart.

🔗 **Live:** https://smokycandle.com

## Features

- **Section-based landing** (`HomePage.tsx`): hero, marquee, product showcase
  with 3D tilt, video, gift sets, brand story, gallery, testimonials, newsletter.
- **Catalog + cart** (client-side): add products and gift sets, change quantity,
  slide-over cart with total.
- **Animations** with `framer-motion` (scroll reveal, magnetic button, scroll
  progress) and a dark theme.
- **Strong SEO**: Open Graph, Twitter card, JSON-LD Organization, manifest,
  multi-format favicons.

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript + React 19 |
| Styling | Tailwind CSS v4 (CSS-first config), Geist font |
| Animation | framer-motion |
| Icons | @phosphor-icons/react |
| Hosting | Vercel |

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Status

This is a **marketing storefront**: the catalog and cart work client-side, while
**checkout** and **newsletter** are scaffolded but not yet wired to a
payment/delivery backend. Content (products, gift sets) is typed data inside the
components — no CMS or database.

## Structure

```
src/
├── app/                  # layout (metadata, JSON-LD), page, globals.css
├── components/
│   ├── home/             # landing sections
│   ├── layout/           # Navbar, Footer
│   ├── cart/             # CartModal
│   └── ui/               # MagneticButton, RevealOnScroll, ScrollProgress
└── lib/utils.ts          # cn() helper
```
