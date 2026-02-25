"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import MarqueeBand from "@/components/home/MarqueeBand";
import ProductShowcase from "@/components/home/ProductShowcase";
import VideoShowcase from "@/components/home/VideoShowcase";
import BundleSection from "@/components/home/BundleSection";
import BrandStory from "@/components/home/BrandStory";
import GallerySection from "@/components/home/GallerySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import Footer from "@/components/layout/Footer";
import CartModal, { type CartItem } from "@/components/cart/CartModal";
import type { Product } from "@/components/home/ProductShowcase";

export default function HomePage() {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleAddToCart = useCallback((product: Product) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setCartOpen(true);
    }, []);

    const handleUpdateQuantity = useCallback(
        (productId: string, delta: number) => {
            setCartItems((prev) =>
                prev.map((i) =>
                    i.product.id === productId
                        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
                        : i
                )
            );
        },
        []
    );

    const handleRemove = useCallback((productId: string) => {
        setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    return (
        <>
            <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
            <main>
                <HeroSection />
                <MarqueeBand />
                <ProductShowcase onAddToCart={handleAddToCart} />
                <VideoShowcase />
                <BundleSection onAddToCart={handleAddToCart} />
                <BrandStory />
                <GallerySection />
                <TestimonialsSection />
                <NewsletterSection />
            </main>
            <Footer />
            <CartModal
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
            />
        </>
    );
}
