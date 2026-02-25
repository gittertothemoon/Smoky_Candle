"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const galleryImages = [
    { src: "/images/hero_3.png", alt: "Smoky Candle atmosfera", span: "col-span-2 row-span-2" },
    { src: "/images/home_5.png", alt: "Candela Butter accesa con packaging", span: "col-span-1 row-span-1" },
    { src: "/images/pack_2.png", alt: "Packaging premium Smoky Candle", span: "col-span-1 row-span-1" },
    { src: "/images/hero_4.png", alt: "Dettaglio cera di soia", span: "col-span-1 row-span-2" },
    { src: "/images/bundle_2.png", alt: "Set regalo invernale", span: "col-span-1 row-span-1" },
    { src: "/images/hero6landing.png", alt: "Candele Smoky Candle in ambiente", span: "col-span-2 row-span-1" },
];

export default function GallerySection() {
    return (
        <section className="relative bg-zinc-950 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <RevealOnScroll>
                    <div className="text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                            Galleria
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tighter text-zinc-50 md:text-5xl">
                            Momenti di luce.
                        </h2>
                    </div>
                </RevealOnScroll>

                {/* Masonry-inspired CSS Grid */}
                <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
                    {galleryImages.map((img, i) => (
                        <RevealOnScroll key={img.src} delay={i * 0.08}>
                            <div
                                className={`group relative overflow-hidden rounded-2xl ${img.span} h-full`}
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-zinc-950/0 transition-colors duration-500 group-hover:bg-zinc-950/20" />
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
}
