"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function BrandStory() {
    return (
        <section id="storia" className="relative overflow-hidden bg-zinc-950 py-24 md:py-32">
            {/* Subtle mesh gradient background */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-900/20 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose-900/15 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6">
                {/* Row 1: Text left, Image right */}
                <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
                    <RevealOnScroll direction="left">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                            La Nostra Storia
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                            Nata dalla passione,
                            <br />
                            <span className="text-zinc-500">fatta a mano in Italia.</span>
                        </h2>
                        <p className="mt-6 max-w-[50ch] text-base leading-relaxed text-zinc-400">
                            Smoky Candle nasce dalla volonta di creare qualcosa di
                            autentico. Ogni candela viene versata a mano nel nostro
                            laboratorio, utilizzando solo cera di soia 100% naturale e
                            fragranze selezionate con cura. Nessun additivo chimico,
                            nessun compromesso.
                        </p>
                        <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-zinc-400">
                            La nostra missione e semplice: portare nelle case italiane una
                            luce calda e un profumo che racconta una storia. Due
                            fragranze, due mondi. Un unico standard di qualita.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="right" delay={0.15}>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/home_1.png"
                                alt="Laboratorio artigianale Smoky Candle"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </RevealOnScroll>
                </div>

                {/* Row 2: Image left, Text right — zig-zag */}
                <div className="mt-24 grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
                    <RevealOnScroll direction="left" delay={0.1}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/home_3.png"
                                alt="Cera di soia naturale"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll direction="right" delay={0.2}>
                        <div className="grid grid-cols-1 gap-8">
                            {[
                                {
                                    title: "Cera di Soia Pura",
                                    desc: "100% vegetale, biodegradabile e a combustion lenta per un esperienza che dura nel tempo.",
                                },
                                {
                                    title: "Fragranze Naturali",
                                    desc: "Oli essenziali e composti aromatici selezionati a mano, senza ftalati ne parabeni.",
                                },
                                {
                                    title: "Packaging Sostenibile",
                                    desc: "Contenitori riutilizzabili e materiali riciclati. Perche la qualita non deve costare al pianeta.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="border-t border-zinc-800 pt-6">
                                    <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </section>
    );
}
