"use client";

import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMovimentoRidotto } from "@/lib/movimento";
import Arco, { ASPETTO_PORTONE } from "@/components/home/Arco";
import type { Candela } from "@/components/home/useCandela";
import { scene, type Atmosfera } from "@/lib/catalogo";

const ORE_TOTALI = 40;

interface HeroProps {
    atmosfera: Atmosfera;
    onAtmosfera: (a: Atmosfera) => void;
    candela: Candela;
}

const scelte: { id: Atmosfera; nome: string; colore: string }[] = [
    { id: "butter", nome: "Butter", colore: "bg-ambra" },
    { id: "berry", nome: "Berry", colore: "bg-vino" },
];

export default function HeroSection({ atmosfera, onAtmosfera, candela }: HeroProps) {
    const ridotto = useMovimentoRidotto();
    const { acceso, spentaConSoffio, ore, finita, girabile, scatola, apri, tappo, stappa, muto, setMuto, audioPronto, preparaSuono, alterna, nuovaCandela } = candela;
    // con "Riduci movimento" pack e tappo non ci sono: la candela è già pronta
    const tappata = tappo !== "via" && !ridotto;

    // l'animazione d'ingresso ha sempre un traguardo: se "Riduci movimento" arriva dopo l'idratazione,
    // gli elementi non devono restare fermi a trasparenza zero (era il vuoto visto su iPhone)
    const entra = (ritardo: number) => ({
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: ridotto
            ? { duration: 0 }
            : { delay: ritardo, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] as const },
    });

    const scena = scene[atmosfera];

    return (
        <section className="relative isolate overflow-hidden bg-fuliggine text-carta">
            {/* la luce della candela che riempie la stanza */}
            <div
                aria-hidden="true"
                className="luce-stanza pointer-events-none absolute inset-0 -z-10 transition-opacity duration-[1800ms]"
                style={{ opacity: acceso ? 1 : 0 }}
            />

            <div className="mx-auto grid min-h-[100svh] max-w-[1320px] grid-cols-1 content-start items-center gap-3 px-4 pt-[4.5rem] pb-14 sm:px-6 md:min-h-[100dvh] md:grid-cols-12 md:content-center md:gap-6 md:pt-24 lg:px-10">
                <div className="order-2 flex flex-col md:order-1 md:col-span-6 md:block lg:col-span-5">
                    {/* titolo e testo si vedono subito: sono il primo contenuto della pagina, niente dissolvenza */}
                    <h1 className="order-1 font-serif text-[clamp(2.4rem,9vw,5.75rem)] leading-[0.95] tracking-[-0.02em] md:text-[clamp(2.75rem,7vw,5.75rem)]">
                        Accendi,
                        <br />
                        <span
                            className="transition-opacity duration-[1600ms]"
                            style={{ opacity: acceso ? 1 : 0.38 }}
                        >
                            la stanza respira.
                        </span>
                    </h1>

                    <p className="order-5 mt-4 max-w-[42ch] text-base leading-relaxed text-carta/75 md:mt-7 md:text-lg">
                        Due candele in cera di soia, colate a mano in Italia, poche alla volta. Lo stoppino in legno crepita piano e ti fa compagnia per oltre quaranta ore.
                    </p>

                    <motion.div className="order-2 mt-5 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-9" {...entra(1.6)}>
                        {scatola !== "via" && !ridotto ? (
                        <button
                            type="button"
                            onClick={apri}
                            className="inline-flex min-h-12 items-center rounded-full bg-carta px-7 text-base text-fuliggine transition-colors hover:bg-white"
                        >
                            Apri la scatola
                        </button>
                        ) : tappata ? (
                        <button
                            type="button"
                            onClick={stappa}
                            disabled={tappo === "svitando"}
                            className="inline-flex min-h-12 items-center rounded-full bg-carta px-7 text-base text-fuliggine transition-colors hover:bg-white disabled:opacity-60"
                        >
                            Svita il tappo
                        </button>
                        ) : finita ? (
                        <button
                            type="button"
                            onClick={nuovaCandela}
                            className="inline-flex min-h-12 items-center rounded-full bg-carta px-7 text-base text-fuliggine transition-colors hover:bg-white"
                        >
                            Accendine un&apos;altra
                        </button>
                        ) : (
                        <button
                            type="button"
                            onClick={alterna}
                            aria-pressed={acceso}
                            className={`inline-flex min-h-12 items-center rounded-full px-7 text-base transition-colors duration-500 ${
                                acceso
                                    ? "border border-carta/35 text-carta hover:bg-carta/10"
                                    : "bg-carta text-fuliggine hover:bg-white"
                            }`}
                        >
                            {acceso ? "Spegni la candela" : "Accendi la candela"}
                        </button>
                        )}
                        <a
                            href="#fragranze"
                            className="text-base text-carta underline decoration-carta/30 underline-offset-4 transition-colors hover:decoration-carta"
                        >
                            Vedi le fragranze
                        </a>
                    </motion.div>

                    {/* sempre in vista: lo scroll da solo non può sbloccare l'audio (regola dei browser), un tocco qui sì */}
                    <button
                        type="button"
                        data-suono
                        onClick={() => {
                            if (!audioPronto || muto) {
                                void preparaSuono();
                                setMuto(false);
                            } else setMuto(true);
                        }}
                        aria-pressed={audioPronto && !muto}
                        className="order-4 mt-3 inline-flex min-h-11 items-center gap-2 self-start rounded-full pr-3 text-sm text-carta/70 transition-colors hover:text-carta md:mt-4"
                    >
                        {audioPronto && !muto ? <SpeakerHigh size={18} aria-hidden="true" /> : <SpeakerSlash size={18} aria-hidden="true" />}
                        {!audioPronto ? "Attiva il suono" : muto ? "Suono spento" : "Suono acceso: lo stoppino crepita"}
                    </button>

                    <div className="order-4 mt-1 min-h-[1.5rem] max-w-[44ch] text-sm leading-relaxed text-carta/60 md:mt-3 md:min-h-[3.25rem]" aria-live="polite">
                        {ore > 0 && (
                            <p className="tabular-nums text-carta/70">
                                {ore} ore di {ORE_TOTALI}
                            </p>
                        )}
                        <AnimatePresence mode="wait">
                            {scatola === "chiusa" && !ridotto ? (
                                <motion.p key="scatola" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.8 } }} exit={{ opacity: 0 }}>
                                    {girabile ? "Afferra il coperchio e tiralo su, oppure cliccaci sopra." : "Tocca la scatola per aprirla."}
                                </motion.p>
                            ) : tappata ? (
                                <motion.p key="tappo" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} exit={{ opacity: 0 }}>
                                    {girabile ? "Clicca sul tappo per svitarlo." : "Tocca il tappo per svitarlo."}
                                </motion.p>
                            ) : finita ? (
                                <motion.p key="finita" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    Quaranta ore di luce, fino all&apos;ultima. Ora il vasetto può restare con te: per i fiori secchi, i pennelli, quello che ti piace.
                                </motion.p>
                            ) : acceso ? (
                                <motion.p key="soffia" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.2 } }} exit={{ opacity: 0 }}>
                                    Passa veloce sopra la fiamma e si spegne, come con un soffio.{girabile ? " Trascinala per girarla." : ""}
                                </motion.p>
                            ) : spentaConSoffio ? (
                                <motion.p key="spenta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    Spenta. Guarda il filo di fumo che sale dallo stoppino.
                                </motion.p>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    <motion.div className="order-3 mt-5 md:mt-6" {...entra(1.75)}>
                        <p id="scegli-atmosfera" className="sr-only text-sm text-carta/60 md:not-sr-only">
                            Scegli l&apos;atmosfera
                        </p>
                        <div
                            role="radiogroup"
                            aria-labelledby="scegli-atmosfera"
                            className="inline-flex rounded-full border border-carta/15 p-1 md:mt-3"
                        >
                            {scelte.map((s) => {
                                const attiva = s.id === atmosfera;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={attiva}
                                        onClick={() => onAtmosfera(s.id)}
                                        className={`relative flex min-h-11 items-center gap-2.5 rounded-full px-5 text-base transition-colors duration-500 ${
                                            attiva ? "text-carta" : "text-carta/70 hover:text-carta"
                                        }`}
                                    >
                                        {attiva && (
                                            <motion.span
                                                layoutId="atmosfera-attiva"
                                                className="absolute inset-0 rounded-full bg-accento transizione-accento"
                                                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                            />
                                        )}
                                        <span className={`relative h-2.5 w-2.5 rounded-full ${s.colore} ring-1 ring-carta/50`} aria-hidden="true" />
                                        <span className="relative">{s.nome}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 font-serif text-base text-carta/85 md:mt-3 md:text-lg">{scena.riga}</p>
                    </motion.div>
                </div>

                <div className="order-1 md:order-2 md:col-span-6 lg:col-start-7">
                    <div
                        className="relative mx-auto w-full max-w-[15rem] sm:max-w-[30rem] md:max-w-[42rem]"
                        style={{ aspectRatio: ASPETTO_PORTONE }}
                    >
                        <Arco acceso={acceso} luce={atmosfera === "berry" ? "#f3cfc6" : "#f2d8b6"} />
                        {/* qui si ferma la candela 3D, che vive in un livello unico sopra la pagina */}
                        <div
                            data-ancora="hero"
                            data-altezza="0.52"
                            data-centro-y="0.64"
                            className="absolute"
                            style={{ left: "10%", right: "10%", top: 0, bottom: 0 }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
