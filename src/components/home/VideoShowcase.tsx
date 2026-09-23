"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

const fatti = [
    { dato: "Oltre 40 ore", testo: "di luce calda per ogni candela" },
    { dato: "Cera di soia", testo: "100% vegetale, brucia lenta e pulita" },
    { dato: "Stoppino in legno", testo: "crepita piano, come un piccolo camino" },
    { dato: "Fragranze IFRA", testo: "profumi certificati, senza ftalati né parabeni" },
];

interface VideoShowcaseProps {
    /** le ore bruciate dalla candela dell'apertura: se l'hai accesa, il primo dato parla della tua */
    ore: number;
    acceso: boolean;
}

export default function VideoShowcase({ ore, acceso }: VideoShowcaseProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [inPausa, setInPausa] = useState(false);

    // il video pesa: si scarica solo quando ci si avvicina. Chi chiede meno movimento lo trova fermo
    const [vicino, setVicino] = useState(false);
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const io = new IntersectionObserver(
            ([voce]) => {
                if (voce.isIntersecting) {
                    setVicino(true);
                    io.disconnect();
                }
            },
            { rootMargin: "100% 0px" }
        );
        io.observe(v);
        return () => io.disconnect();
    }, []);
    useEffect(() => {
        const v = videoRef.current;
        if (!vicino || !v) return;
        v.load();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void v.play().catch(() => {});
    }, [vicino]);

    function alterna() {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play();
        else v.pause();
    }

    const pausa = (
        <button
            type="button"
            onClick={alterna}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-carta/40 text-carta transition-colors hover:bg-carta/10"
            aria-label={inPausa ? "Riproduci il video" : "Metti in pausa il video"}
        >
            {inPausa ? <Play size={18} weight="fill" aria-hidden="true" /> : <Pause size={18} weight="fill" aria-hidden="true" />}
        </button>
    );

    return (
        // il video è girato in verticale (9:16): sul telefono riempie lo schermo, sullo schermo grande sta in colonna
        // nel suo formato vero. Ritagliarlo a 21:9 ne lasciava una striscia ingrandita, schiacciata e sgranata
        <section className="relative bg-fuliggine text-carta">
            <div className="mx-auto md:grid md:max-w-[1320px] md:grid-cols-12 md:items-center md:gap-6 md:px-6 md:py-24 lg:px-10">
                <div className="relative aspect-[4/5] w-full overflow-hidden md:order-2 md:col-span-5 md:col-start-8 md:mx-auto md:aspect-[9/16] md:h-[min(84vh,880px)] md:w-auto">
                    <video
                        ref={videoRef}
                        onPlay={() => setInPausa(false)}
                        onPause={() => setInPausa(true)}
                        muted
                        loop
                        playsInline
                        preload="none"
                        className="h-full w-full object-cover"
                        poster="/images/video-poster.webp"
                        aria-label="Un fiammifero accende una candela Butter"
                    >
                        {vicino && <source src="/images/home_2-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />}
                        {vicino && <source src="/images/home_2.mp4" type="video/mp4" />}
                    </video>
                    {/* telefono: il titolo sta sul video, in basso */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fuliggine via-fuliggine/10 to-transparent md:hidden" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-4 pb-8 sm:px-6 md:hidden">
                        <h2 className="max-w-[14ch] font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1]">
                            Si accende piano, dura a lungo.
                        </h2>
                        {pausa}
                    </div>
                    <div className="absolute right-4 bottom-4 hidden md:block">{pausa}</div>
                </div>

                <div className="md:order-1 md:col-span-6">
                    <h2 className="hidden max-w-[12ch] font-serif text-[clamp(3rem,5.5vw,5.5rem)] leading-[0.95] tracking-[-0.015em] md:block">
                        Si accende piano, dura a lungo.
                    </h2>
                    <dl className="grid grid-cols-1 gap-x-10 gap-y-8 px-4 py-16 sm:grid-cols-2 sm:px-6 md:mt-14 md:px-0 md:py-0">
                        {fatti.map((f, i) => (
                            <div key={f.dato} className="border-t border-carta/15 pt-5">
                                <dt className="font-serif text-2xl">{f.dato}</dt>
                                <dd className="mt-2 text-base leading-relaxed text-carta/75">
                                    {f.testo}
                                    {i === 0 && ore > 0 && (
                                        <span className="mt-1 block text-carta" aria-live="polite">
                                            {ore >= 40
                                                ? "La tua le ha fatte tutte."
                                                : `La tua ne ha già fatte ${ore}${acceso ? ", e sta ancora bruciando." : "."}`}
                                        </span>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
