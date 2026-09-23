"use client";

import Image from "next/image";
import { cofanetti, type Articolo } from "@/lib/catalogo";

interface BundleSectionProps {
    onAddToCart: (articolo: Articolo) => void;
}

export default function BundleSection({ onAddToCart }: BundleSectionProps) {
    return (
        <>
        {/* scena ferma: mentre scorri la candela torna nella sua scatola, pronta da regalare */}
        <section id="cofanetti" className="relative h-[220vh] bg-fuliggine text-carta">
            <div className="sticky top-0 mx-auto flex h-[100dvh] max-w-[1320px] flex-col px-4 pt-[4.5rem] pb-6 sm:px-6 md:grid md:grid-cols-12 md:items-center md:gap-6 md:pt-20 lg:px-10">
                {/* telefono: la scatola sta sopra il testo, in un posto fisso: il coperchio scende da dove non c'è niente da leggere */}
                {/* stessa misura di candela di prima (0,74 x 38 = 0,64 x 44), ma più in alto: meno vuoto quando la sezione arriva */}
                <div className="relative h-[38svh] shrink-0 md:hidden">
                    <div data-ancora="cofanetti" data-altezza="0.74" data-centro-y="0.5" className="absolute inset-0" />
                </div>

                <div className="md:col-span-6 lg:col-span-5">
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.015em]">
                        Pensati per essere regalati.
                    </h2>
                    <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-carta/75">
                        Ogni candela parte nella sua scatola a tubo, bianca, col portone stampato davanti. Si apre come l&apos;hai aperta tu qui sopra.
                    </p>
                    <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-carta/55">
                        Le stesse due candele, in tre confezioni diverse. Spedizione gratuita in Italia, consegna in 2-4 giorni.
                    </p>
                </div>
                <div className="relative hidden min-h-0 md:col-span-6 md:col-start-7 md:block md:h-full">
                    <div data-ancora="cofanetti" data-altezza="0.66" data-centro-y="0.52" className="absolute inset-0" />
                </div>
            </div>
        </section>

        <section aria-label="I cofanetti" className="bg-carta">
            <div className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 md:py-28 lg:px-10">

                <ul className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {cofanetti.map((c) => (
                        <li key={c.id} className="flex flex-col">
                            <div className="relative aspect-square overflow-hidden bg-cenere-scura">
                                <Image
                                    src={c.immagine}
                                    alt={`Cofanetto ${c.nome}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>
                            <div className="mt-6 flex items-baseline justify-between gap-4">
                                <h3 className="font-serif text-3xl">{c.nome}</h3>
                                <p className="font-serif text-2xl">{c.prezzo}&nbsp;&euro;</p>
                            </div>
                            <p className="mt-3 max-w-[40ch] flex-1 text-base leading-relaxed text-fumo">{c.descrizione}</p>
                            <button
                                type="button"
                                onClick={() => onAddToCart(c)}
                                className="mt-6 inline-flex min-h-12 items-center justify-center self-start rounded-full border border-fuliggine/25 px-6 text-base text-fuliggine transition-colors hover:border-fuliggine hover:bg-fuliggine hover:text-carta"
                            >
                                Aggiungi al carrello
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
        </>
    );
}
