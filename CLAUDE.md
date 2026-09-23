# Smoky Candle — note di lavoro

Sito di smokycandle.com: il primo progetto ufficiale di Ivan, candele in cera di soia vere (stock fisico, una trentina vendute a mano).
Next.js 16 (Turbopack) + React 19 + Tailwind v4 + framer-motion + three.js (R3F 9, drei 10).

## Stato attuale — 23/09/2026

- **Branch `rinfrescata-2026-09`**: la rinfrescata completa, **NON pubblicata**. `main` e il sito online sono ancora la versione di maggio.
- Prima di pubblicare serve il via di Ivan. Il merge su `main` fa partire il deploy Vercel.

## Come si lavora

- Sviluppo: `npm run dev -- -H 0.0.0.0 -p 3100`. **Mai `npx next dev`**: scarica un Next globale e rompe l'avvio.
- Dal telefono sulla stessa rete: `http://<ip del Mac>:3100` (serve `allowedDevOrigins` in `next.config.ts`).
- Per provare la velocità vera sul telefono: `npm run build && npx next start -H 0.0.0.0 -p 3200`.
- Collaudo automatico (apre la scatola, accende, scorre, fotografa): script puppeteer-core in `pup/` dello scratchpad di sessione;
  le misure e gli screenshot stanno in `~/local/portfolio/portfolio-pionio/_lavorazione/caso-studio-smoky/`.

## Com'è fatta la pagina

- `HomePage.tsx`: stato della candela (`useCandela.ts`) e un solo `Candela3D` **fisso su tutta la pagina**, montato a pagina ferma
  (requestIdleCallback). La candela segue le ancore `data-ancora` (hero, fragranze, cofanetti), una per telefono e una per schermo grande.
- `Candela3D.tsx`: vasetto (misure dalla foto IMG_6016), etichetta vera dai PDF di stampa, fiamma in shader, fumo, scatola a tubo
  che si apre a mano e si richiude scorrendo, soffio che spegne. Sul telefono (`leggero`) vetro semplice invece della rifrazione.
- `Arco.tsx` + `portone.ts`: il portone del marchio, tracciato vettoriale originale estratto dal PDF di stampa. Non ridisegnarlo.
- `src/lib/crepitio.ts`: tutti i suoni generati in Web Audio (crepitio, soffio, stappo, spegnimento sotto il coperchio).
- `src/lib/movimento.ts`: "Riduci movimento" letto senza rompere l'idratazione. Non usare `useReducedMotion` di framer.

## Trappole già pagate

- R3F copia le `uniforms` dello shaderMaterial: si aggiornano via ref sul materiale.
- In GLSL `smoothstep(a,b,x)` con a>b è indefinito: scrivere `1.0 - smoothstep(b,a,x)`.
- Il vetro con rifrazione fotografa la scena: etichetta e scatola vanno escluse (`fuoriDalVetro`), se no fanno il fantasma sul vetro.
- Su iPhone: `formatDetection` spento (Safari trasforma numeri e email in link e rompe l'idratazione).
- Sul telefono il comando principale deve stare nel primo schermo (misurare su 390x664 e 375x560).
- Il logo del pack è un'immagine già pronta (`public/images/scatola-coperchio.webp`, grigia, senza il nome): costruirla nel
  browser era lenta su iPhone e il pack arrivava dopo la candela. Se cambia l'etichetta va rigenerata (appoggiata sul bianco:
  gli angoli trasparenti diventano neri). La tela 3D entra in dissolvenza solo quando vasetto, etichetta e pack sono pronti.
- I suoni di pack e tappo partono dall'animazione (fotogramma del distacco, ogni quarto di giro), mai da un timer a parte.
- Sul telefono la tela 3D non è fissa: vive dentro l'ancora e scorre con la pagina. Una tela fissa che insegue lo scroll
  arriva un fotogramma dopo e su iPhone sobbalza. La tela ha la stessa misura in ogni ancora (ridimensionarla la svuota)
  e si cambia ancora fuori schermo, lasciando una foto ferma in quella che esce.

## Onestà dei contenuti

Niente recensioni inventate, niente prezzi barrati mai praticati, niente newsletter finta. Il checkout è un ordine via mail precompilata
a info@smokycandle.it finché non c'è un pagamento vero (serve la P.IVA, decisione di Ivan).
