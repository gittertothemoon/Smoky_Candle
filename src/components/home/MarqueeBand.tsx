"use client";

import { motion } from "framer-motion";
import React from "react";

const words = [
    "Cera di Soia",
    "Made in Italy",
    "Artigianale",
    "Fragranze Naturali",
    "Versata a Mano",
    "Sostenibile",
    "Butter",
    "Berry",
    "Premium",
    "100% Naturale",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
    const content = [...words, ...words];

    return (
        <div className="flex overflow-hidden py-4">
            <motion.div
                className="flex shrink-0 gap-8"
                animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{
                    duration: 30,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {content.map((word, i) => (
                    <span
                        key={`${word}-${i}`}
                        className="whitespace-nowrap text-3xl font-bold tracking-tighter text-zinc-800 md:text-5xl"
                    >
                        {word}
                        <span className="mx-6 inline-block h-2 w-2 rounded-full bg-accent align-middle" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

const MarqueeBand = React.memo(function MarqueeBand() {
    return (
        <section className="relative overflow-hidden border-y border-zinc-200 bg-zinc-50 py-6 dark:border-zinc-800 dark:bg-zinc-900">
            <MarqueeRow />
            <MarqueeRow reverse />
        </section>
    );
});

MarqueeBand.displayName = "MarqueeBand";

export default MarqueeBand;
