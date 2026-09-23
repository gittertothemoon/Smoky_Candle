"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

const fatti = [
    { dato: "Oltre 40 ore", testo: "di combustione per ogni candela" },
    { dato: "Cera di soia", testo: "100% vegetale, niente paraffina" },
    { dato: "Stoppino in legno", testo: "crepita piano, come un piccolo camino" },
    { dato: "Fragranze IFRA", testo: "senza ftalati e senza parabeni" },
];

export default function VideoShowcase() {
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

    return (
        <section className="relative bg-fuliggine text-carta">
            <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[21/9]">
                <video
                    ref={videoRef}
                    onPlay={() => setInPausa(false)}
                    onPause={() => setInPausa(true)}
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="h-full w-full object-cover"
                    poster="/images/hero_7.webp"
                    aria-label="La fiamma di una candela Smoky Candle"
                >
                    {vicino && <source src="/images/home_2-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />}
                    {vicino && <source src="/images/home_2.mp4" type="video/mp4" />}
                </video>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fuliggine via-fuliggine/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1320px] items-end justify-between gap-6 px-4 pb-8 sm:px-6 md:pb-14 lg:px-10">
                    <h2 className="max-w-[14ch] font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1]">
                        Lenta, calda, senza scorciatoie.
                    </h2>
                    <button
                        type="button"
                        onClick={alterna}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-carta/40 text-carta transition-colors hover:bg-carta/10"
                        aria-label={inPausa ? "Riproduci il video" : "Metti in pausa il video"}
                    >
                        {inPausa ? <Play size={18} weight="fill" aria-hidden="true" /> : <Pause size={18} weight="fill" aria-hidden="true" />}
                    </button>
                </div>
            </div>

            <dl className="mx-auto grid max-w-[1320px] grid-cols-1 gap-x-10 gap-y-8 px-4 py-16 sm:grid-cols-2 sm:px-6 md:py-20 lg:grid-cols-4 lg:px-10">
                {fatti.map((f) => (
                    <div key={f.dato} className="border-t border-carta/15 pt-5">
                        <dt className="font-serif text-2xl">{f.dato}</dt>
                        <dd className="mt-2 text-base leading-relaxed text-carta/75">{f.testo}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
