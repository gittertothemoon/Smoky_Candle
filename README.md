# Smoky Candle

Storefront vetrina per **Smoky Candle**, candele di soia artigianali Made in
Italy. Single-page in italiano, animata, con catalogo, cofanetti e carrello
client-side.

🔗 **Live:** https://smoky-candle.vercel.app

## Caratteristiche

- **Landing a sezioni** (`HomePage.tsx`): hero, marquee, showcase prodotti con
  tilt 3D, video, cofanetti, brand story, gallery, testimonianze, newsletter.
- **Catalogo + carrello** client-side: aggiunta prodotti e cofanetti, modifica
  quantità, slide-over carrello con totale.
- **Animazioni** con `framer-motion` (reveal allo scroll, magnetic button,
  scroll progress) e tema dark.
- **SEO forte**: Open Graph, Twitter card, JSON-LD Organization, manifest,
  favicon multi-formato.

## Stack

| Ambito | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Linguaggio | TypeScript + React 19 |
| Styling | Tailwind CSS v4 (config CSS-first), font Geist |
| Animazioni | framer-motion |
| Icone | @phosphor-icons/react |
| Hosting | Vercel |

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:3000
```

### Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Dev server Next |
| `npm run build` | Build di produzione |
| `npm run start` | Server di produzione |
| `npm run lint` | ESLint |

## Stato

È una **vetrina marketing**: catalogo e carrello sono funzionanti lato client,
mentre **checkout** e **newsletter** sono predisposti ma non collegati a un
backend di pagamento/invio. I contenuti (prodotti, cofanetti) sono dati
tipizzati nei componenti — nessun CMS né database.

## Struttura

```
src/
├── app/                  # layout (metadata, JSON-LD), page, globals.css
├── components/
│   ├── home/             # sezioni della landing
│   ├── layout/           # Navbar, Footer
│   ├── cart/             # CartModal
│   └── ui/               # MagneticButton, RevealOnScroll, ScrollProgress
└── lib/utils.ts          # helper cn()
```
