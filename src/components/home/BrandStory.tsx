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
                            Il nostro laboratorio
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                            Una candela alla volta,
                            <br />
                            <span className="text-zinc-500">una mano alla volta.</span>
                        </h2>
                        <p className="mt-6 max-w-[50ch] text-base leading-relaxed text-zinc-400">
                            Coliamo ogni candela a mano nel nostro laboratorio, in lotti piccoli. Cera di soia pura, niente paraffina, niente scorciatoie. Quello che mettiamo dentro è quello che senti quando la accendi.
                        </p>
                        <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-zinc-400">
                            Due fragranze, non venti. Perché prima di metterle in vendita le abbiamo bruciate per intero, una dopo l'altra. Solo queste due continuavano a sorprenderci fino all'ultima ora.
                        </p>
                    </RevealOnScroll>

                    <RevealOnScroll direction="right" delay={0.15}>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                            <Image
                                src="/images/home_1.webp"
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
                                src="/images/home_3.webp"
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
                                    title: "Cera di soia pura",
                                    desc: "Vegetale, biodegradabile, a combustione lenta. Oltre 40 ore di luce calda, senza fumo nero e con un finale pulito sul vetro.",
                                },
                                {
                                    title: "Fragranze pulite",
                                    desc: "Solo oli essenziali e composti aromatici certificati IFRA. Niente ftalati, niente parabeni. Lo stoppino è in legno: crepita piano mentre brucia, come un piccolo camino.",
                                },
                                {
                                    title: "Un vetro che vive",
                                    desc: "Quando la candela finisce, il bicchiere comincia una seconda vita. Spazzolini, fiori secchi, piccoli rituali. A te scegliere quale.",
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
