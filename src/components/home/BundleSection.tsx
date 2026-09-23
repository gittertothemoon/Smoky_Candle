"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { cofanetti, type Articolo } from "@/lib/catalogo";
import { PUNTI_COFANETTI, SOGLIE_COFANETTI } from "@/lib/fasiCofanetti";

interface BundleSectionProps {
    onAddToCart: (articolo: Articolo) => void;
}

export default function BundleSection({ onAddToCart }: BundleSectionProps) {
    // la scelta segue lo scroll: la sezione resta ferma e scorrendo si passa da un cofanetto all'altro
    const scena = useRef<HTMLElement>(null);
    const [indice, setIndice] = useState(0);
    const { scrollYProgress } = useScroll({ target: scena, offset: ["start start", "end end"] });
    useMotionValueEvent(scrollYProgress, "change", (p) => {
        const i = p < SOGLIE_COFANETTI[0] ? 0 : p < SOGLIE_COFANETTI[1] ? 1 : 2;
        if (i !== indice) setIndice(i);
    });
    // un tocco sull'elenco porta al punto della corsa in cui quel cofanetto è montato
    function vaiA(i: number) {
        const el = scena.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * PUNTI_COFANETTI[i], behavior: "smooth" });
    }

    return (
        <>
        {/* scena ferma: mentre scorri la candela torna nella sua scatola, pronta da regalare */}
        <section id="cofanetti" className="relative h-[220vh] bg-fuliggine text-carta">
            {/* sul telefono il blocco è alto quanto il suo contenuto: niente mezzo schermo vuoto sotto il testo quando finisce */}
            <div className="sticky top-0 mx-auto flex max-w-[1320px] flex-col px-4 pt-[4.5rem] pb-6 sm:px-6 md:grid md:h-[100dvh] md:grid-cols-12 md:items-center md:gap-6 md:pt-20 lg:px-10">
                {/* telefono: la scatola sta sopra il testo, in un posto fisso: il coperchio scende da dove non c'è niente da leggere */}
                {/* stessa misura di candela di prima (0,74 x 38 = 0,64 x 44), ma più in alto: meno vuoto quando la sezione arriva */}
                <div className="relative h-[38svh] shrink-0 md:hidden">
                    <div data-ancora="cofanetti" data-altezza="0.74" data-centro-y="0.5" className="absolute inset-0" />
                </div>

                <div className="md:col-span-6 lg:col-span-5">
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.015em]">
                        Pensati per essere regalati.
                    </h2>
                    <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-carta/75">
                        Ogni candela arriva nella sua scatola a tubo bianca, con il portone stampato davanti. Si apre proprio come l&apos;hai aperta tu qui sopra.
                    </p>
                    <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-carta/55">
                        Per regalarle ci sono tre confezioni, dalla più semplice a quella col biglietto scritto a mano. La spedizione in Italia è gratuita e arriva in 2-4 giorni.
                    </p>
                </div>
                <div className="relative hidden min-h-0 md:col-span-6 md:col-start-7 md:block md:h-full">
                    <div data-ancora="cofanetti" data-altezza="0.66" data-centro-y="0.52" className="absolute inset-0" />
                </div>
            </div>
        </section>

        {/* la scena 3D continua: il pack chiuso se ne va e la candela diventa il cofanetto che scegli */}
        <section ref={scena} id="scegli-cofanetto" aria-label="I cofanetti" className="relative h-[420vh] bg-fuliggine text-carta">
            <div className="sticky top-0 mx-auto flex h-[100dvh] max-w-[1320px] flex-col px-4 pt-[4.5rem] pb-6 sm:px-6 md:grid md:grid-cols-12 md:items-center md:gap-6 md:pt-20 lg:px-10">
                {/* sul telefono scena e scheda devono stare insieme nello schermo, anche basso: la scheda del Discovery è la più lunga */}
                <div className="relative h-[35svh] shrink-0 md:order-2 md:col-span-7 md:h-[76vh] [@media(max-height:620px)]:h-[31svh]">
                    {/* sullo schermo grande la colonna è alta: il cofanetto con la scatola ci deve stare intero */}
                    <div data-ancora="composizione" data-altezza="0.52" data-centro-y="0.62" className="absolute inset-0 md:hidden" />
                    <div data-ancora="composizione" data-altezza="0.4" data-centro-y="0.56" className="absolute inset-0 hidden md:block" />
                </div>

                <div className="mt-4 md:order-1 md:col-span-5 md:mt-0">
                    <div role="radiogroup" aria-label="Scegli il cofanetto">
                        {cofanetti.map((c, i) => {
                            const scelto = i === indice;
                            return (
                                <div key={c.id} className="border-t border-carta/15 first:border-t-0">
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={scelto}
                                        onClick={() => vaiA(i)}
                                        className={`flex min-h-12 w-full items-baseline justify-between gap-4 py-3 text-left transition-colors duration-300 md:min-h-16 md:py-4 ${
                                            scelto ? "text-carta" : "text-carta/45 hover:text-carta/80"
                                        }`}
                                    >
                                        <span className="font-serif text-[clamp(1.5rem,3.2vw,2.75rem)] leading-none">{c.nome}</span>
                                        <span className="font-serif text-xl md:text-2xl">{c.prezzo}&nbsp;&euro;</span>
                                    </button>
                                    {/* la scheda si apre solo sul cofanetto scelto: grid-rows anima l'altezza senza misurarla */}
                                    <div
                                        className="grid transition-[grid-template-rows] duration-500 ease-out"
                                        style={{ gridTemplateRows: scelto ? "1fr" : "0fr" }}
                                        inert={!scelto}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-carta/75 md:text-base">{c.descrizione}</p>
                                            <button
                                                type="button"
                                                onClick={() => onAddToCart(c)}
                                                className="mt-3 mb-4 inline-flex min-h-12 items-center rounded-full bg-carta px-7 text-base text-fuliggine transition-colors hover:bg-white md:mt-5 md:mb-6"
                                            >
                                                Aggiungi {c.nome} al carrello
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}
