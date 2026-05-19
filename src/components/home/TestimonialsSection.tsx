"use client";

import { Star } from "@phosphor-icons/react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const testimonials = [
    {
        name: "Martina Ferretti",
        location: "Milano",
        text: "Butter scalda davvero la stanza. Dopo dieci minuti la cucina sa di vaniglia e legno, ma con leggerezza. La accendo ogni sera, è diventata un rituale.",
        variant: "Butter",
        rating: 5,
    },
    {
        name: "Alessandro Morandi",
        location: "Roma",
        text: "Ho regalato il Duo per il compleanno della mia ragazza. Il packaging è stato già un regalo a sé. Mi ha scritto la sera stessa per dirmi che la casa profumava.",
        variant: "Duo",
        rating: 5,
    },
    {
        name: "Giulia De Santis",
        location: "Firenze",
        text: "Berry vive nella mia camera da letto. La accendo mentre leggo: si sente ma non invade, riempie l'aria senza appesantirla. La dose giusta di profumo.",
        variant: "Berry",
        rating: 5,
    },
    {
        name: "Marco Bianchi",
        location: "Torino",
        text: "Cercavo una candela che bruciasse pulita, senza quella scia nera sul vetro. L'ho trovata. Cera vera, fiamma stabile, profumo che non stanca dopo due ore.",
        variant: "Butter",
        rating: 5,
    },
];

export default function TestimonialsSection() {
    return (
        <section className="relative bg-zinc-950 py-24 md:py-32">
            {/* Subtle background */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-amber-800/20 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6">
                <RevealOnScroll>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                        Chi le accende
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Le parole di chi vive le nostre fragranze.
                    </h2>
                </RevealOnScroll>

                {/* Asymmetric 2-column grid instead of forbidden 3-column */}
                <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                    {testimonials.map((t, i) => (
                        <RevealOnScroll key={i} delay={i * 0.1}>
                            <div
                                className={`border-t border-zinc-800 pt-8 ${i % 2 === 1 ? "md:mt-12" : ""
                                    }`}
                            >
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star
                                            key={j}
                                            size={14}
                                            weight="fill"
                                            className="text-accent"
                                        />
                                    ))}
                                </div>
                                {/* Quote */}
                                <p className="mt-4 text-base leading-relaxed text-zinc-300">
                                    &quot;{t.text}&quot;
                                </p>
                                {/* Author */}
                                <div className="mt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-200">
                                            {t.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">{t.location}</p>
                                    </div>
                                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
                                        {t.variant}
                                    </span>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
