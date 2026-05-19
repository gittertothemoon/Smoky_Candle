"use client";

import { InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer id="contatti" className="border-t border-zinc-800 bg-zinc-950 py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
                    {/* Brand */}
                    <div>
                        <Image
                            src="/images/wordmark.webp"
                            alt="Smoky Candle"
                            width={200}
                            height={200}
                            className="h-24 w-auto [filter:brightness(0)_invert(1)]"
                        />
                        <p className="mt-4 max-w-[35ch] text-sm leading-relaxed text-zinc-500">
                            Candele in cera di soia, colate a mano nel nostro laboratorio in Italia. Due fragranze pensate per durare.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                            Navigazione
                        </h4>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: "Fragranze", href: "#fragranze" },
                                { label: "Laboratorio", href: "#storia" },
                                { label: "Contatti", href: "#contatti" },
                            ].map((l) => (
                                <li key={l.href}>
                                    <a
                                        href={l.href}
                                        className="link-underline hover:link-underline-hover text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                            Contatti
                        </h4>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <a
                                    href="mailto:info@smokycandle.it"
                                    className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                                >
                                    <EnvelopeSimple size={16} weight="light" />
                                    info@smokycandle.it
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://instagram.com/smokycandle"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                                >
                                    <InstagramLogo size={16} weight="light" />
                                    @smokycandle
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} Smoky Candle · Colate a mano in Italia
                </div>
            </div>
        </footer>
    );
}
