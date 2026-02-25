"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, List, X } from "@phosphor-icons/react";
import MagneticButton from "@/components/ui/MagneticButton";
import Image from "next/image";

interface NavbarProps {
    cartCount: number;
    onCartOpen: () => void;
}

export default function Navbar({ cartCount, onCartOpen }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const links = [
        { label: "La Nostra Storia", href: "#storia" },
        { label: "Fragranze", href: "#fragranze" },
        { label: "Contatti", href: "#contatti" },
    ];

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled
                    ? "liquid-glass-dark py-3"
                    : "bg-transparent py-5"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3">
                    <Image
                        src="/images/logo.png"
                        alt="Smoky Candle"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="text-lg font-semibold tracking-tighter text-zinc-50">
                        Smoky Candle
                    </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-50"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <MagneticButton
                        variant="ghost"
                        size="sm"
                        onClick={onCartOpen}
                        className="relative text-zinc-50"
                    >
                        <ShoppingBag size={22} weight="light" />
                        <AnimatePresence>
                            {cartCount > 0 && (
                                <motion.span
                                    key="cart-badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-zinc-900"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </MagneticButton>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="text-zinc-50 md:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        {menuOpen ? (
                            <X size={24} weight="light" />
                        ) : (
                            <List size={24} weight="light" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="border-t border-white/10 px-6 py-6">
                            {links.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    className="block py-3 text-lg text-zinc-200 transition-colors hover:text-zinc-50"
                                    onClick={() => setMenuOpen(false)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
