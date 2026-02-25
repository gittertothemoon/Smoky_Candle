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
            "Una fragranza calda e avvolgente ispirata al burro fuso e alla vaniglia artigianale. Perfetta per serate tranquille e momenti di relax.",
        notes: ["Vaniglia", "Burro fuso", "Legno di cedro"],
        image: "/images/butter.png",
        accentColor: "text-amber-300",
    },
    {
        id: "berry",
        name: "Smoky Candle",
        variant: "Berry",
        price: 34,
        description:
            "Un bouquet fruttato e sofisticato con bacche selvatiche e rosa damascena. Per chi cerca eleganza e vitalita in ogni stanza.",
        notes: ["Frutti di bosco", "Rosa damascena", "Muschio bianco"],
        image: "/images/berry.png",
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
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                        src={product.image}
                        alt={`${product.name} ${product.variant}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p
                        className={`text-sm font-medium uppercase tracking-[0.2em] ${product.accentColor}`}
                    >
                        {product.variant}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tighter text-zinc-50 md:text-3xl">
                        {product.name}
                    </h3>
                    <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-zinc-400">
                        {product.description}
                    </p>
                    {/* Notes */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {product.notes.map((note) => (
                            <span
                                key={note}
                                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                    {/* Price + CTA */}
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-2xl font-bold tracking-tight text-zinc-50">
                            {product.price}&euro;
                        </span>
                        <MagneticButton
                            variant="primary"
                            size="md"
                            onClick={() => onAddToCart(product)}
                        >
                            Aggiungi al Carrello
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
                        Due Fragranze
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Scegli la tua essenza.
                    </h2>
                    <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-zinc-500">
                        Ogni candela e versata a mano con cera di soia 100% naturale.
                        Due personalita distinte per due atmosfere uniche.
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
