"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "@phosphor-icons/react";
import Image from "next/image";
import { EMAIL_ORDINI, type Articolo } from "@/lib/catalogo";

export interface CartItem {
    articolo: Articolo;
    quantity: number;
}

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

/** La mail d'ordine già compilata: righe, quantità, totale, e lo spazio per l'indirizzo. */
function linkOrdine(items: CartItem[], totale: number) {
    const righe = items.map(
        (i) => `- ${i.quantity} x ${i.articolo.nome} (${i.articolo.prezzo} euro cad.) = ${i.articolo.prezzo * i.quantity} euro`
    );
    const corpo = [
        "Ciao Smoky Candle, vorrei ordinare:",
        "",
        ...righe,
        "",
        `Totale: ${totale} euro, spedizione gratuita in Italia.`,
        "",
        "Nome e cognome:",
        "Indirizzo di spedizione:",
        "Telefono per il corriere:",
    ].join("\n");
    return `mailto:${EMAIL_ORDINI}?subject=${encodeURIComponent("Ordine dal sito")}&body=${encodeURIComponent(corpo)}`;
}

export default function CartModal({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartModalProps) {
    const chiudiRef = useRef<HTMLButtonElement>(null);
    const totale = items.reduce((sum, i) => sum + i.articolo.prezzo * i.quantity, 0);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        chiudiRef.current?.focus();
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 bg-fuliggine/40 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titolo-carrello"
                        className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-carta text-fuliggine shadow-[-24px_0_60px_-30px_rgba(31,25,22,0.45)]"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 34 }}
                    >
                        <div className="flex items-center justify-between border-b border-fuliggine/10 px-6 py-4">
                            <h2 id="titolo-carrello" className="font-serif text-2xl">
                                Il tuo ordine
                            </h2>
                            <button
                                ref={chiudiRef}
                                type="button"
                                onClick={onClose}
                                className="flex h-11 w-11 items-center justify-center rounded-full text-fuliggine transition-colors hover:bg-fuliggine/5"
                                aria-label="Chiudi il carrello"
                            >
                                <X size={22} weight="light" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {items.length === 0 ? (
                                <div className="py-16">
                                    <p className="font-serif text-2xl">Il carrello è ancora vuoto.</p>
                                    <p className="mt-2 max-w-[32ch] text-base text-fumo">
                                        Scegli Butter, Berry o un cofanetto e lo ritrovi qui.
                                    </p>
                                    <a
                                        href="#fragranze"
                                        onClick={onClose}
                                        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-fuliggine px-6 text-base text-carta"
                                    >
                                        Vedi le fragranze
                                    </a>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {items.map((item) => (
                                            <motion.li
                                                key={item.articolo.id}
                                                layout
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 40 }}
                                                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                                                className="flex gap-4"
                                            >
                                                <div
                                                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-cenere-scura"
                                                    style={{ borderRadius: "999px 999px 0 0 / 40% 40% 0 0" }}
                                                >
                                                    <Image src={item.articolo.immagine} alt="" fill className="object-cover" sizes="80px" />
                                                </div>

                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <p className="font-serif text-xl">{item.articolo.nome}</p>
                                                        <p className="text-base">{item.articolo.prezzo * item.quantity}&nbsp;&euro;</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                item.quantity === 1
                                                                    ? onRemove(item.articolo.id)
                                                                    : onUpdateQuantity(item.articolo.id, -1)
                                                            }
                                                            aria-label={item.quantity === 1 ? `Togli ${item.articolo.nome}` : `Una ${item.articolo.nome} in meno`}
                                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-fuliggine/20 transition-colors hover:bg-fuliggine/5"
                                                        >
                                                            <Minus size={14} aria-hidden="true" />
                                                        </button>
                                                        <span className="w-8 text-center text-base" aria-live="polite">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateQuantity(item.articolo.id, 1)}
                                                            aria-label={`Una ${item.articolo.nome} in più`}
                                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-fuliggine/20 transition-colors hover:bg-fuliggine/5"
                                                        >
                                                            <Plus size={14} aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="border-t border-fuliggine/10 px-6 py-6">
                                <div className="mb-5 flex items-baseline justify-between">
                                    <span className="text-base text-fumo">Totale</span>
                                    <span className="font-serif text-3xl">{totale}&nbsp;&euro;</span>
                                </div>
                                <a
                                    href={linkOrdine(items, totale)}
                                    className="flex min-h-13 w-full items-center justify-center rounded-full bg-accento text-base text-carta transizione-accento hover:opacity-90"
                                >
                                    Invia l&apos;ordine via mail
                                </a>
                                <p className="mt-3 text-sm leading-relaxed text-fumo">
                                    Si apre la tua mail con l&apos;ordine già scritto. Ti scriviamo noi entro un giorno lavorativo per il pagamento. La spedizione in Italia è gratuita.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
