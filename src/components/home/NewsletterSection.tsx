"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneTilt, Check } from "@phosphor-icons/react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import MagneticButton from "@/components/ui/MagneticButton";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setSubmitted(true);
    }

    return (
        <section className="relative overflow-hidden bg-zinc-900 py-24 md:py-32">
            {/* Mesh gradient background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[150px]" />
                <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-rose-900/10 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-3xl px-6 text-center">
                <RevealOnScroll>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                        Resta Connesso
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Non perderti le novita.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[45ch] text-base leading-relaxed text-zinc-400">
                        Iscriviti alla newsletter per ricevere anteprime esclusive,
                        offerte riservate e la storia dietro ogni fragranza.
                    </p>
                </RevealOnScroll>

                {/* Form */}
                <RevealOnScroll delay={0.2}>
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="relative flex-1">
                                    <label htmlFor="newsletter-email" className="sr-only">
                                        Email
                                    </label>
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="La tua email"
                                        required
                                        className="w-full rounded-full border border-zinc-700 bg-zinc-800/50 px-5 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                                    />
                                </div>
                                <MagneticButton variant="primary" size="md">
                                    <span className="flex items-center gap-2">
                                        Iscriviti
                                        <PaperPlaneTilt size={16} weight="bold" />
                                    </span>
                                </MagneticButton>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-full border border-emerald-800/50 bg-emerald-900/20 px-6 py-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                                    <Check size={16} weight="bold" className="text-zinc-950" />
                                </div>
                                <p className="text-sm font-medium text-emerald-300">
                                    Iscrizione confermata. Benvenuto nella community!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="mt-4 text-xs text-zinc-600">
                        Nessuno spam, promesso. Puoi disiscriverti in qualsiasi momento.
                    </p>
                </RevealOnScroll>
            </div>
        </section>
    );
}
