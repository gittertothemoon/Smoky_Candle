"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function VideoShowcase() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.5], [48, 0]);

    return (
        <section
            ref={containerRef}
            className="relative bg-zinc-950 py-16 md:py-24"
        >
            <div className="mx-auto max-w-7xl px-6">
                <RevealOnScroll>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                        La fiamma
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Lenta, calda,
                        <br />
                        <span className="text-zinc-500">senza scorciatoie.</span>
                    </h2>
                </RevealOnScroll>
            </div>

            <motion.div
                className="relative mx-auto mt-12 overflow-hidden"
                style={{ scale, opacity, borderRadius }}
            >
                <div className="relative aspect-[4/5] w-full md:aspect-video">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                        poster="/images/hero_6.webp"
                    >
                        <source src="/images/home_2-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
                        <source src="/images/home_2.mp4" type="video/mp4" />
                    </video>
                    {/* Gradient edge vignette */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-zinc-950/30" />
                </div>
            </motion.div>
        </section>
    );
}
