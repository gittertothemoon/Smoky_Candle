"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Product } from "@/components/home/ProductShowcase";
import { products } from "@/components/home/ProductShowcase";

const bundles = [
    {
        id: "duo-pack",
        name: "Duo Pack",
        description:
            "Entrambe le fragranze in un unico cofanetto regalo. Perfetto per chi non sa scegliere.",
        price: 58,
        originalPrice: 68,
        image: "/images/bundle_1.png",
        products: ["butter", "berry"],
    },
    {
        id: "gift-set",
        name: "Gift Set Premium",
        description:
            "Il cofanetto completo con packaging esclusivo, ideale per un regalo indimenticabile.",
        price: 62,
        originalPrice: 72,
        image: "/images/bundle_2.png",
        products: ["butter", "berry"],
    },
    {
        id: "discovery-box",
        name: "Discovery Box",
        description:
            "La collezione completa Smoky Candle con packaging di lusso e card personalizzata.",
        price: 65,
        originalPrice: 78,
        image: "/images/bundle_3.png",
        products: ["butter", "berry"],
    },
];

interface BundleSectionProps {
    onAddToCart: (product: Product) => void;
}

export default function BundleSection({ onAddToCart }: BundleSectionProps) {
    const handleAddBundle = (bundleId: string) => {
        const bundle = bundles.find((b) => b.id === bundleId);
        if (!bundle) return;
        bundle.products.forEach((pid) => {
            const product = products.find((p) => p.id === pid);
            if (product) onAddToCart(product);
        });
    };

    return (
        <section className="relative bg-zinc-950 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <RevealOnScroll>
                    <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                        Cofanetti Regalo
                    </p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                        Regala un&apos;emozione.
                    </h2>
                    <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-zinc-500">
                        Scopri i nostri cofanetti curati, pensati per chi ama fare regali
                        speciali. Ogni set include entrambe le fragranze.
                    </p>
                </RevealOnScroll>

                {/* Horizontal scroll cards */}
                <div className="mt-16 -mx-6 px-6">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                        {bundles.map((bundle, i) => (
                            <RevealOnScroll key={bundle.id} delay={i * 0.1}>
                                <div className="w-[320px] flex-shrink-0 snap-start md:w-[380px]">
                                    <div className="group relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800/50">
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={bundle.image}
                                                alt={bundle.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="380px"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                                            {/* Discount badge */}
                                            <div className="absolute top-4 right-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-zinc-900">
                                                -{Math.round(
                                                    ((bundle.originalPrice - bundle.price) /
                                                        bundle.originalPrice) *
                                                    100
                                                )}
                                                %
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold tracking-tight text-zinc-100">
                                                {bundle.name}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                                {bundle.description}
                                            </p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <span className="text-2xl font-bold tracking-tight text-zinc-50">
                                                    {bundle.price}&euro;
                                                </span>
                                                <span className="text-sm text-zinc-600 line-through">
                                                    {bundle.originalPrice}&euro;
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <MagneticButton
                                                    variant="primary"
                                                    size="md"
                                                    onClick={() => handleAddBundle(bundle.id)}
                                                    className="w-full justify-center"
                                                >
                                                    Aggiungi al Carrello
                                                </MagneticButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
