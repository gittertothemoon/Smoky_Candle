"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { fragranze, type Articolo, type Atmosfera } from "@/lib/catalogo";

interface ProductShowcaseProps {
    atmosfera: Atmosfera;
    onAtmosfera: (a: Atmosfera) => void;
    onAddToCart: (articolo: Articolo) => void;
}

const coloreDi: Record<Atmosfera, string> = {
    butter: "text-[#e0a15c]",
    berry: "text-[#e27d8f]",
};

const bottoneDi: Record<Atmosfera, string> = {
    butter: "bg-ambra",
    berry: "bg-vino",
};

/*
 * Le fragranze come una scena ferma: la sezione resta inchiodata allo schermo
 * mentre scorri, la candela 3D gira su se stessa e a metà giro, quando l'etichetta
 * è di spalle, diventa l'altra fragranza.
 */
export default function ProductShowcase({ onAtmosfera, onAddToCart }: ProductShowcaseProps) {
    const sezione = useRef<HTMLElement>(null);
    const [indice, setIndice] = useState(0);
    const { scrollYProgress } = useScroll({ target: sezione, offset: ["start start", "end end"] });

    useMotionValueEvent(scrollYProgress, "change", (p) => {
        const i = p < 0.5 ? 0 : 1;
        if (i !== indice) {
            setIndice(i);
            onAtmosfera(fragranze[i].atmosfera);
        }
    });

    const f = fragranze[indice];

    // le linguette portano al punto della sezione in cui la candela mostra quella fragranza
    function vaiA(i: number) {
        const el = sezione.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const corsa = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + corsa * (i === 0 ? 0.12 : 0.78), behavior: "smooth" });
    }

    return (
        <section ref={sezione} id="fragranze" className="relative h-[300vh] bg-fuliggine text-carta">
            {/* sul telefono il blocco è alto quanto il suo contenuto: niente vuoto sotto il bottone quando la sezione finisce */}
            <div className="sticky top-0 overflow-hidden md:h-[100dvh]">
                {/* il colore della fragranza che si diffonde dietro la candela */}
                {/* (due strati in dissolvenza: i gradienti non si possono animare direttamente) */}
                {fragranze.map((x) => (
                    <div
                        key={x.id}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 transition-opacity duration-[1200ms]"
                        style={{
                            opacity: x.id === f.id ? 1 : 0,
                            background: `radial-gradient(50% 55% at 74% 52%, ${x.atmosfera === "berry" ? "rgba(138,20,48,0.34)" : "rgba(156,79,22,0.32)"}, transparent 72%)`,
                        }}
                    />
                ))}
            <div className="relative mx-auto flex max-w-[1320px] md:h-full flex-col px-4 pt-[4.5rem] pb-6 sm:px-6 md:grid md:grid-cols-12 md:items-center md:gap-6 md:pt-20 lg:px-10">
                {/* telefono: la candela ha un posto fisso in alto, alto quanto il 36% dello schermo piccolo (svh),
                    così non cambia misura col testo né con la barra di Safari */}
                <div className="relative mb-3 h-[31svh] shrink-0 md:hidden [@media(max-height:620px)]:h-[26svh]">
                    {/* centro un po' sopra la metà: la misura conta anche la scatola, più alta del vasetto */}
                    <div data-ancora="fragranze" data-altezza="0.9" data-centro-y="0.4" className="absolute inset-0" />
                </div>

                <div className="md:col-span-6 lg:col-span-5">
                    <h2 className="sr-only md:not-sr-only md:text-base md:text-carta/60">Due fragranze, non venti.</h2>
                    <div role="tablist" aria-label="Fragranze" className="flex gap-2 md:mt-3">
                        {fragranze.map((x, i) => (
                            <button
                                key={x.id}
                                type="button"
                                role="tab"
                                aria-selected={i === indice}
                                onClick={() => vaiA(i)}
                                className={`min-h-11 rounded-full border px-5 text-base transition-colors duration-500 ${
                                    i === indice ? "border-carta bg-carta text-fuliggine" : "border-carta/20 text-carta/70 hover:text-carta"
                                }`}
                            >
                                {x.nome}
                            </button>
                        ))}
                    </div>

                    {/* il nome cambia lettera per lettera, come un tabellone */}
                    <h3
                        className={`mt-3 flex overflow-hidden font-serif text-[clamp(2.75rem,10vw,8rem)] leading-[0.95] transition-colors duration-700 md:mt-10 ${coloreDi[f.atmosfera]}`}
                        aria-label={f.nome}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {f.nome.split("").map((c, i) => (
                                <motion.span
                                    key={f.id + i}
                                    aria-hidden="true"
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: "0%", opacity: 1 }}
                                    exit={{ y: "-100%", opacity: 0 }}
                                    transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 0.61, 0.36, 1] }}
                                    className="inline-block"
                                >
                                    {c}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </h3>

                    {/* le due schede stanno una sopra l'altra nello stesso spazio: si scambiano in dissolvenza
                        senza che il blocco cambi altezza (smontare e rimontare lo accorciava e faceva sfarfallare) */}
                    <div className="grid">
                        {fragranze.map((x) => {
                            const attiva = x.id === f.id;
                            return (
                                <div
                                    key={x.id}
                                    aria-hidden={!attiva}
                                    inert={!attiva}
                                    className="[grid-area:1/1] transition-[opacity,transform] ease-out"
                                    style={{
                                        opacity: attiva ? 1 : 0,
                                        transform: attiva ? "none" : "translateY(10px)",
                                        // esce in fretta, entra appena dopo: mai due testi sovrapposti a metà
                                        transitionDuration: attiva ? "420ms" : "180ms",
                                        transitionDelay: attiva ? "160ms" : "0ms",
                                    }}
                                >
                                    <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-carta/85 md:mt-6 md:text-lg">{x.descrizione}</p>
                                    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-carta/15 pt-2 md:mt-6 md:gap-x-6 md:gap-y-2 md:pt-5" aria-label="Note">
                                        {x.note.split(", ").map((nota) => (
                                            <li key={nota} className="font-serif text-sm text-carta/75 first-letter:uppercase md:text-lg">
                                                {nota}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex flex-wrap items-center gap-6 md:mt-8">
                                        <button
                                            type="button"
                                            onClick={() => onAddToCart(x)}
                                            className={`inline-flex min-h-12 items-center rounded-full px-7 text-base text-carta transition-opacity hover:opacity-90 ${bottoneDi[x.atmosfera]}`}
                                        >
                                            Aggiungi {x.nome} al carrello
                                        </button>
                                        <p className="font-serif text-2xl md:text-3xl">{x.prezzo}&nbsp;&euro;</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* qui si ferma la candela 3D mentre gira */}
                <div className="relative hidden min-h-0 md:col-span-6 md:col-start-7 md:block md:h-full">
                    <div data-ancora="fragranze" data-altezza="0.74" data-centro-y="0.52" className="absolute inset-0" />
                </div>
            </div>
            </div>
        </section>
    );
}
