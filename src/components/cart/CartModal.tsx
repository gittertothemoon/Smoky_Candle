"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "@phosphor-icons/react";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Product } from "@/components/home/ProductShowcase";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
}

export default function CartModal({
    isOpen,
    onClose,
    items,
    onUpdateQuantity,
    onRemove,
}: CartModalProps) {
    const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Slide-over panel */}
                    <motion.div
                        className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-zinc-900 border-l border-zinc-800"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={22} weight="light" className="text-zinc-300" />
                                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                                    Il tuo Carrello
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-zinc-500 transition-colors hover:text-zinc-200"
                                aria-label="Chiudi carrello"
                            >
                                <X size={22} weight="light" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <ShoppingBag
                                        size={48}
                                        weight="thin"
                                        className="text-zinc-700"
                                    />
                                    <p className="mt-4 text-sm text-zinc-500">
                                        Il carrello e vuoto.
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Aggiungi una fragranza per iniziare.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.product.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: 50 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 200,
                                                    damping: 20,
                                                }}
                                                className="flex gap-4"
                                            >
                                                {/* Thumb */}
                                                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.variant}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-zinc-100">
                                                            {item.product.name}
                                                        </p>
                                                        <p
                                                            className={`text-xs font-medium ${item.product.accentColor}`}
                                                        >
                                                            {item.product.variant}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity controls */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    item.quantity === 1
                                                                        ? onRemove(item.product.id)
                                                                        : onUpdateQuantity(item.product.id, -1)
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-800"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="w-6 text-center text-sm font-medium text-zinc-200">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    onUpdateQuantity(item.product.id, 1)
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-800"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        <span className="text-sm font-bold text-zinc-100">
                                                            {item.product.price * item.quantity}&euro;
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-zinc-800 px-6 py-6">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm text-zinc-400">Totale</span>
                                    <span className="text-xl font-bold tracking-tight text-zinc-50">
                                        {total}&euro;
                                    </span>
                                </div>
                                <MagneticButton
                                    variant="primary"
                                    size="lg"
                                    className="w-full justify-center"
                                >
                                    Procedi al Checkout
                                </MagneticButton>
                                <p className="mt-3 text-center text-xs text-zinc-600">
                                    Spedizione gratuita in tutta Italia
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
