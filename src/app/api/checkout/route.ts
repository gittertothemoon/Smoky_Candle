import { NextResponse } from "next/server";
import { cofanetti, fragranze, type Articolo } from "@/lib/catalogo";

/*
 * Il pagamento: crea una sessione di Stripe Checkout e rimanda l'URL della pagina di pagamento.
 * Dal carrello arrivano solo gli articoli e le quantità: i prezzi li legge qui, dal catalogo,
 * così nessuno può cambiarli dal browser.
 */

const catalogo = new Map<string, Articolo>([...fragranze, ...cofanetti].map((a) => [a.id, a]));

// il nome che compare nella pagina di pagamento e sulla ricevuta
const nomeInCassa = (a: Articolo) => (fragranze.some((f) => f.id === a.id) ? `Candela ${a.nome}` : a.nome);

interface Riga {
    id: string;
    quantita: number;
}

function leggiRighe(corpo: unknown): Riga[] | null {
    const righe = (corpo as { righe?: unknown })?.righe;
    if (!Array.isArray(righe) || righe.length === 0 || righe.length > 10) return null;
    const pulite: Riga[] = [];
    for (const r of righe) {
        const id = (r as { id?: unknown })?.id;
        const quantita = (r as { quantita?: unknown })?.quantita;
        if (typeof id !== "string" || !catalogo.has(id)) return null;
        if (typeof quantita !== "number" || !Number.isInteger(quantita) || quantita < 1 || quantita > 20) return null;
        pulite.push({ id, quantita });
    }
    return pulite;
}

export async function POST(req: Request) {
    const chiave = process.env.STRIPE_SECRET_KEY;
    if (!chiave) return NextResponse.json({ errore: "Pagamenti non configurati" }, { status: 503 });

    let corpo: unknown;
    try {
        corpo = await req.json();
    } catch {
        return NextResponse.json({ errore: "Richiesta non valida" }, { status: 400 });
    }
    const righe = leggiRighe(corpo);
    if (!righe) return NextResponse.json({ errore: "Carrello non valido" }, { status: 400 });

    // dove si torna dopo il pagamento: il sito da cui è partita la richiesta, solo se è uno dei nostri
    const richiesta = req.headers.get("origin") ?? new URL(req.url).origin;
    const nostro = /^https:\/\/(www\.)?smokycandle\.com$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1|172\.20\.10\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;
    const origine = nostro.test(richiesta) ? richiesta : "https://smokycandle.com";
    const p = new URLSearchParams();
    p.set("mode", "payment");
    p.set("locale", "it");
    p.set("success_url", `${origine}/?ordine=ok`);
    p.set("cancel_url", `${origine}/?ordine=annullato`);
    righe.forEach((r, i) => {
        const a = catalogo.get(r.id)!;
        const base = `line_items[${i}]`;
        p.set(`${base}[quantity]`, String(r.quantita));
        p.set(`${base}[price_data][currency]`, "eur");
        p.set(`${base}[price_data][unit_amount]`, String(a.prezzo * 100));
        p.set(`${base}[price_data][product_data][name]`, nomeInCassa(a));
        // le immagini Stripe le va a prendere lui: solo da un indirizzo pubblico
        if (origine.startsWith("https://")) p.set(`${base}[price_data][product_data][images][0]`, `${origine}${a.immagine}`);
    });
    p.set("shipping_address_collection[allowed_countries][0]", "IT");
    const spedizione = "shipping_options[0][shipping_rate_data]";
    p.set(`${spedizione}[type]`, "fixed_amount");
    p.set(`${spedizione}[fixed_amount][amount]`, "0");
    p.set(`${spedizione}[fixed_amount][currency]`, "eur");
    p.set(`${spedizione}[display_name]`, "Spedizione gratuita in Italia");
    p.set(`${spedizione}[delivery_estimate][minimum][unit]`, "business_day");
    p.set(`${spedizione}[delivery_estimate][minimum][value]`, "2");
    p.set(`${spedizione}[delivery_estimate][maximum][unit]`, "business_day");
    p.set(`${spedizione}[delivery_estimate][maximum][value]`, "4");
    p.set("phone_number_collection[enabled]", "true");
    // l'identità della pagina di pagamento: il conto Stripe è condiviso, qui si presenta come Smoky Candle
    p.set("branding_settings[display_name]", "Smoky Candle");
    p.set("branding_settings[background_color]", "#f5f2ee");
    p.set("branding_settings[button_color]", "#9c4f16");
    p.set("branding_settings[border_style]", "pill");
    if (origine.startsWith("https://")) {
        p.set("branding_settings[logo][type]", "url");
        p.set("branding_settings[logo][url]", `${origine}/images/logo-cassa.png`);
        p.set("branding_settings[icon][type]", "url");
        p.set("branding_settings[icon][url]", `${origine}/images/icona-cassa.png`);
    }
    // sull'estratto conto, dopo il prefisso dell'account
    p.set("payment_intent_data[statement_descriptor_suffix]", "SMOKY CANDLE");

    const risposta = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: p,
    });
    const sessione = (await risposta.json()) as { url?: string; error?: { message?: string } };
    if (!risposta.ok || !sessione.url) {
        console.error("Stripe Checkout:", sessione.error?.message);
        return NextResponse.json({ errore: "Il pagamento non è partito" }, { status: 502 });
    }
    return NextResponse.json({ url: sessione.url });
}
