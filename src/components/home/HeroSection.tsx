"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "@/components/ui/MagneticButton";
import Image from "next/image";

export default function HeroSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[100dvh] overflow-hidden bg-zinc-950"
        >
            {/* Background Image with Parallax */}
            <motion.div className="absolute inset-0" style={{ y: bgY }}>
                <Image
                    src="/images/hero_7.png"
                    alt="Candela artigianale Smoky Candle"
                    fill
                    className="object-cover opacity-60"
                    priority
                    sizes="100vw"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />
            </motion.div>

            {/* Content — Asymmetric left-aligned per SKILL.md */}
            <motion.div
                className="relative z-10 flex min-h-[100dvh] items-center"
                style={{ y: textY, opacity }}
            >
                <div className="mx-auto w-full max-w-7xl px-6">
                    <div className="max-w-2xl">
                        {/* Eyebrow */}
                        <motion.p
                            className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-accent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
                        >
                            Artigianale / Made in Italy
                        </motion.p>

                        {/* Main Heading */}
                        <motion.h1
                            className="text-4xl font-bold leading-none tracking-tighter text-zinc-50 md:text-6xl lg:text-7xl"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                        >
                            Luce soffice,
                            <br />
                            <span className="text-zinc-400">fragranza autentica.</span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            className="mt-6 max-w-[50ch] text-base leading-relaxed text-zinc-400 md:text-lg"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                        >
                            Ogni candela Smoky Candle nasce da cera di soia pura, versata a
                            mano in Italia. Due fragranze uniche per trasformare ogni ambiente.
                        </motion.p>

                        {/* CTA */}
                        <motion.div
                            className="mt-10 flex flex-wrap gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <MagneticButton variant="primary" size="lg">
                                <a href="#fragranze">Scopri le Fragranze</a>
                            </MagneticButton>
                            <MagneticButton variant="outline" size="lg" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
                                <a href="#storia">La Nostra Storia</a>
                            </MagneticButton>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="h-14 w-[1px] bg-gradient-to-b from-transparent via-zinc-500 to-transparent" />
            </motion.div>
        </section>
    );
}
