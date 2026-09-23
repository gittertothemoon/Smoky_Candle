"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useMovimentoRidotto } from "@/lib/movimento";
import { useCandela } from "@/components/home/useCandela";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ProductShowcase from "@/components/home/ProductShowcase";
import VideoShowcase from "@/components/home/VideoShowcase";
import BundleSection from "@/components/home/BundleSection";
import BrandStory from "@/components/home/BrandStory";
import Footer from "@/components/layout/Footer";
import CartModal, { type CartItem } from "@/components/cart/CartModal";
import { cofanetti, fragranze, type Articolo, type Atmosfera } from "@/lib/catalogo";

// il 3D arriva dopo: la pagina si legge subito, la candela entra quando è pronta
const Candela3D = dynamic(() => import("@/components/home/Candela3D"), { ssr: false });

export default function HomePage() {
    const [atmosfera, setAtmosfera] = useState<Atmosfera>("butter");
    const candela = useCandela();
    const ridotto = useMovimentoRidotto();
    // il 3D parte quando la pagina è già in piedi: prima testo e immagini, poi la candela
    const [tre, setTre] = useState(false);
    // (e solo a caricamento finito: il motore 3D pesa, e sul telefono non deve rubare il processore
    // proprio mentre la pagina diventa toccabile. La candela entra comunque in dissolvenza)
    useEffect(() => {
        let annullato = false;
        let id = 0;
        let t: ReturnType<typeof setTimeout> | undefined;
        const w = window as Window & {
            requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        const avvia = () => {
            if (!annullato) setTre(true);
        };
        const quandoLibero = () => {
            if (w.requestIdleCallback) id = w.requestIdleCallback(avvia, { timeout: 2000 });
            else t = setTimeout(avvia, 300);
        };
        if (document.readyState === "complete") quandoLibero();
        else window.addEventListener("load", quandoLibero, { once: true });
        return () => {
            annullato = true;
            window.removeEventListener("load", quandoLibero);
            if (id) w.cancelIdleCallback?.(id);
            if (t) clearTimeout(t);
        };
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

    /*
     * Il carrello sopravvive al passaggio da Stripe: chi annulla il pagamento lo ritrova com'era.
     * Solo gli id e le quantità, riletti dal catalogo (prezzi e nomi restano quelli del sito).
     * Al ritorno da un pagamento riuscito si svuota e compare il grazie.
     */
    const [esito, setEsito] = useState<"ok" | "annullato" | null>(null);
    const carrelloLetto = useRef(false);
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get("ordine");
        const riuscito = q === "ok";
        try {
            if (riuscito) localStorage.removeItem("carrello");
            else {
                const salvato = JSON.parse(localStorage.getItem("carrello") ?? "[]") as { id: string; q: number }[];
                const tutti: Articolo[] = [...fragranze, ...cofanetti];
                const ritrovati: CartItem[] = [];
                for (const r of salvato) {
                    const articolo = tutti.find((a) => a.id === r.id);
                    if (articolo && Number.isInteger(r.q) && r.q > 0) ritrovati.push({ articolo, quantity: r.q });
                }
                // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal browser dopo l'idratazione
                if (ritrovati.length) setCartItems(ritrovati);
            }
        } catch {
            // navigazione privata o storage bloccato: il carrello parte vuoto
        }
        carrelloLetto.current = true;
        if (q === "ok" || q === "annullato") {
            setEsito(q);
            if (q === "annullato") setCartOpen(true);
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);
    useEffect(() => {
        if (!carrelloLetto.current) return;
        try {
            localStorage.setItem("carrello", JSON.stringify(cartItems.map((i) => ({ id: i.articolo.id, q: i.quantity }))));
        } catch {
            // niente storage: pazienza
        }
    }, [cartItems]);
    useEffect(() => {
        if (!esito) return;
        const t = setTimeout(() => setEsito(null), 9000);
        return () => clearTimeout(t);
    }, [esito]);

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
                <VideoShowcase ore={candela.ore} acceso={candela.acceso} />
                <BrandStory />
            </main>
            <Footer acceso={candela.acceso} ore={candela.ore} />
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
            {/* l'esito del pagamento, al ritorno da Stripe */}
            {esito && (
                <div
                    role="status"
                    className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-carta px-5 py-4 text-fuliggine shadow-[0_10px_40px_rgba(0,0,0,0.35)] md:bottom-6"
                >
                    <p className="font-serif text-xl">{esito === "ok" ? "Grazie, è tutto a posto." : "Pagamento annullato."}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fumo">
                        {esito === "ok"
                            ? "Il pagamento è andato a buon fine. Ti scriviamo appena la tua candela parte."
                            : "Nessun addebito. Il carrello è rimasto com'era, quando vuoi riprendi da lì."}
                    </p>
                    <button type="button" onClick={() => setEsito(null)} className="mt-2 min-h-11 text-sm underline underline-offset-4">
                        Chiudi
                    </button>
                </div>
            )}
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
