"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMovimentoRidotto } from "@/lib/movimento";
import { useCandela } from "@/components/home/useCandela";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ProductShowcase from "@/components/home/ProductShowcase";
import VideoShowcase from "@/components/home/VideoShowcase";
import BundleSection from "@/components/home/BundleSection";
import BrandStory from "@/components/home/BrandStory";
import ComeOrdinare from "@/components/home/ComeOrdinare";
import Footer from "@/components/layout/Footer";
import CartModal, { type CartItem } from "@/components/cart/CartModal";
import type { Articolo, Atmosfera } from "@/lib/catalogo";

// il 3D arriva dopo: la pagina si legge subito, la candela entra quando è pronta
const Candela3D = dynamic(() => import("@/components/home/Candela3D"), { ssr: false });

export default function HomePage() {
    const [atmosfera, setAtmosfera] = useState<Atmosfera>("butter");
    const candela = useCandela();
    const ridotto = useMovimentoRidotto();
    // il 3D parte quando la pagina è già in piedi: prima testo e immagini, poi la candela
    const [tre, setTre] = useState(false);
    useEffect(() => {
        const avvia = () => setTre(true);
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
        if (w.requestIdleCallback) {
            const id = w.requestIdleCallback(avvia, { timeout: 1500 });
            return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
        }
        const t = setTimeout(avvia, 600);
        return () => clearTimeout(t);
    }, []);
    // quando fragranze o cofanetti arrivano a metà schermo la candela si scopre da sola (anche dopo un salto con un link)
    const { scopri } = candela;
    useEffect(() => {
        if (ridotto) return;
        const io = new IntersectionObserver(
            (voci) => {
                if (voci.some((v) => v.isIntersecting)) scopri();
            },
            { rootMargin: "0px 0px -50% 0px" }
        );
        ["fragranze", "cofanetti"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, [ridotto, scopri]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleAddToCart = useCallback((articolo: Articolo) => {
        setCartItems((prev) => {
            const esiste = prev.find((i) => i.articolo.id === articolo.id);
            if (esiste) {
                return prev.map((i) => (i.articolo.id === articolo.id ? { ...i, quantity: i.quantity + 1 } : i));
            }
            return [...prev, { articolo, quantity: 1 }];
        });
        setCartOpen(true);
    }, []);

    const handleUpdateQuantity = useCallback((id: string, delta: number) => {
        setCartItems((prev) =>
            prev.map((i) => (i.articolo.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        );
    }, []);

    const handleRemove = useCallback((id: string) => {
        setCartItems((prev) => prev.filter((i) => i.articolo.id !== id));
    }, []);

    const chiudiCarrello = useCallback(() => setCartOpen(false), []);

    return (
        <div data-atmosfera={atmosfera}>
            <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
            <main>
                <HeroSection atmosfera={atmosfera} onAtmosfera={setAtmosfera} candela={candela} />
                <ProductShowcase atmosfera={atmosfera} onAtmosfera={setAtmosfera} onAddToCart={handleAddToCart} />
                <BundleSection onAddToCart={handleAddToCart} />
                <VideoShowcase />
                <BrandStory />
                <ComeOrdinare />
            </main>
            <Footer />
            {tre && <Candela3D
                scatola={ridotto ? "via" : candela.scatola}
                onApri={candela.apri}
                onAperta={candela.aperta}
                tappo={ridotto ? "via" : candela.tappo}
                onStappa={candela.stappa}
                onTolto={candela.tolto}
                onSuono={candela.suona}
                acceso={candela.acceso}
                atmosfera={atmosfera}
                rinnovo={candela.rinnovo}
                girabile={candela.girabile}
                onSoffio={candela.soffio}
                onSoffocata={candela.soffocata}
                onOre={candela.setOre}
                onFinita={candela.finisce}
            />}
            <CartModal
                isOpen={cartOpen}
                onClose={chiudiCarrello}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
            />
        </div>
    );
}
