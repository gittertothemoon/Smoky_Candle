"use client";

import { useRef } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import MagneticButton from "@/components/ui/MagneticButton";

export interface Product {
    id: string;
    name: string;
    variant: string;
    price: number;
    description: string;
    notes: string[];
    image: string;
    accentColor: string;
}

export const products: Product[] = [
    {
        id: "butter",
        name: "Smoky Candle",
        variant: "Butter",
        price: 34,
        description:
            "Vaniglia bourbon, burro caldo, una scia di cedro sul fondo. La fragranza che chiama il divano, una coperta e le sere lunghe.",
        notes: ["Vaniglia", "Burro fuso", "Legno di cedro"],
        image: "/images/butter.webp",
        accentColor: "text-amber-300",
    },
    {
        id: "berry",
        name: "Smoky Candle",
        variant: "Berry",
        price: 34,
        description:
            "Frutti di bosco appena raccolti, rosa damascena, muschio bianco. Apre la stanza con leggerezza, lascia respirare l'aria.",
        notes: ["Frutti di bosco", "Rosa damascena", "Muschio bianco"],
        image: "/images/berry.webp",
        accentColor: "text-rose-400",
    },
];

function TiltCard({
    product,
    onAddToCart,
}: {
    product: Product;
    onAddToCart: (p: Product) => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 150, damping: 20 });
    const springY = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(px);
        y.set(py);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={cardRef}
            className="group relative"
            style={{
                rotateX,
                rotateY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800/50">
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                        src={product.image}
                        alt={`${product.name} ${product.variant}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-900 to-transparent" />
                </div>

                {/* Info panel — separato dall'immagine per leggibilità */}
                <div className="relative px-8 pt-7 pb-8">
                    <p
                        className={`text-sm font-medium uppercase tracking-[0.2em] ${product.accentColor}`}
                    >
                        {product.variant}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tighter text-zinc-50 md:text-3xl">
                        {product.name}
                    </h3>
                    <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-zinc-300">
                        {product.description}
                    </p>
                    {/* Notes */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {product.notes.map((note) => (
                            <span
                                key={note}
                                className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                    {/* Price + CTA */}
                    <div className="mt-7 flex items-center justify-between border-t border-zinc-800/70 pt-6">
                        <div className="flex flex-col">
                            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                                Prezzo
                            </span>
                            <span className="text-2xl font-bold tracking-tight text-zinc-50">
                                {product.price}&euro;
                            </span>
                        </div>
                        <MagneticButton
                            variant="primary"
                            size="md"
                            onClick={() => onAddToCart(product)}
                        >
                            Aggiungi al carrello
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface ProductShowcaseProps {
    onAddToCart: (product: Product) => void;
}

export default function ProductShowcase({ onAddToCart }: ProductShowcaseProps) {
    return (
        <section id="fragranze" className="relative bg-zinc-950 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section header */}
                <RevealOnScroll>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                        Le fragranze
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Due atmosfere, una stessa cura.
                    </h2>
                    <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-zinc-500">
                        Le componiamo nello stesso laboratorio, con la stessa cera e le stesse mani. A cambiare è solo l’atmosfera che decidi di accendere.
                    </p>
                </RevealOnScroll>

                {/* Product Grid — 2 columns, zig-zag offset */}
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                    {products.map((product, i) => (
                        <RevealOnScroll key={product.id} delay={i * 0.15}>
                            <div className={i === 1 ? "md:mt-16" : ""}>
                                <TiltCard product={product} onAddToCart={onAddToCart} />
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
