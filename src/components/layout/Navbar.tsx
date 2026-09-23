"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Handbag, List, X } from "@phosphor-icons/react";
import Image from "next/image";

interface NavbarProps {
    cartCount: number;
    onCartOpen: () => void;
}

const links = [
    { label: "Fragranze", href: "#fragranze" },
    { label: "Cofanetti", href: "#cofanetti" },
    { label: "Laboratorio", href: "#laboratorio" },
    { label: "Come si ordina", href: "#come-ordinare" },
];

export default function Navbar({ cartCount, onCartOpen }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // in cima è trasparente sopra l'apertura buia; scorrendo diventa una barra scura
    const alBuio = !scrolled && !menuOpen;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500 ${
                alBuio ? "border-b border-transparent" : "border-b border-carta/10 bg-fuliggine/85 backdrop-blur-lg"
            }`}
        >
            <nav className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6 md:h-20 lg:px-10">
                <a href="#" aria-label="Smoky Candle, torna all'inizio" className="-ml-2 flex h-full items-center">
                    <Image
                        src="/images/wordmark.webp"
                        alt=""
                        width={200}
                        height={200}
                        priority
                        className={`h-16 w-auto md:h-20 [filter:brightness(0)_invert(1)]`}
                    />
                </a>

                <ul className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`text-[0.95rem] transition-colors text-carta/80 hover:text-carta`}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onCartOpen}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors text-carta hover:bg-carta/10`}
                        aria-label={cartCount > 0 ? `Apri il carrello, ${cartCount} articoli` : "Apri il carrello"}
                    >
                        <Handbag size={24} weight="light" aria-hidden="true" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    key={cartCount}
                                    initial={{ scale: 0.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.4, opacity: 0 }}
                                    className="absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accento px-1 text-xs text-carta transizione-accento"
                                    aria-hidden="true"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <button
                        type="button"
                        className={`flex h-11 w-11 items-center justify-center rounded-full md:hidden text-carta`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Chiudi il menu" : "Apri il menu"}
                        aria-expanded={menuOpen}
                        aria-controls="menu-mobile"
                    >
                        {menuOpen ? <X size={24} weight="light" aria-hidden="true" /> : <List size={24} weight="light" aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {menuOpen && (
                    <motion.ul
                        id="menu-mobile"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                        className="overflow-hidden px-4 sm:px-6 md:hidden"
                    >
                        {links.map((link) => (
                            <li key={link.href} className="border-t border-carta/10">
                                <a
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-4 font-serif text-2xl text-carta"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </header>
    );
}
