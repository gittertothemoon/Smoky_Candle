"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMovimentoRidotto } from "@/lib/movimento";

const principi = [
    {
        titolo: "Cera di soia pura",
        testo: "Vegetale e biodegradabile. Brucia piano, con una luce calda, e lascia il vetro pulito fino alla fine.",
    },
    {
        titolo: "Profumi delicati",
        testo: "Profumi certificati IFRA, senza ftalati né parabeni. Lo stoppino in legno crepita piano mentre la candela brucia.",
    },
    {
        titolo: "Un vetro che vive",
        testo: "Quando la candela finisce, il vasetto può restare con te: per i fiori secchi, i pennelli, le piccole cose di casa.",
    },
];

/*
 * Il laboratorio si accende mentre ci arrivi: la foto nell'arco parte al buio, fredda, e scorrendo
 * verso il centro dello schermo si scalda; la sua luce esce dall'arco e si allarga sulla pagina chiara,
 * come la luce della stanza nell'apertura. Accesa, respira piano come una fiamma.
 */
export default function BrandStory() {
    const ridotto = useMovimentoRidotto();
    const arco = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: arco, offset: ["start end", "center 55%"] });
    const acceso = useTransform(scrollYProgress, [0.15, 1], [0, 1], { clamp: true });
    const filtro = useTransform(
        acceso,
        (a) => `brightness(${0.28 + a * 0.72}) saturate(${0.35 + a * 0.65}) sepia(${(1 - a) * 0.35})`
    );
    const luce = useTransform(acceso, [0.35, 1], [0, 1]);

    return (
        <section id="laboratorio" className="relative isolate mx-auto max-w-[1320px] px-4 pt-24 pb-20 sm:px-6 md:pt-36 md:pb-24 lg:px-10">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
                <div className="relative md:col-span-5">
                    {/* la luce che esce dall'arco e scalda la pagina */}
                    <motion.div
                        aria-hidden="true"
                        className="respiro-luce pointer-events-none absolute -inset-[35%] -z-10"
                        style={{
                            opacity: ridotto ? 1 : luce,
                            background:
                                "radial-gradient(50% 45% at 50% 42%, color-mix(in srgb, var(--luce-candela) 55%, transparent), transparent 70%)",
                        }}
                    />
                    <div
                        ref={arco}
                        className="relative aspect-[3/4] overflow-hidden bg-fuliggine"
                        style={{ borderRadius: "999px 999px 0 0 / 38% 38% 0 0" }}
                    >
                        <motion.div className="absolute inset-0" style={{ filter: ridotto ? "none" : filtro }}>
                            <Image
                                src="/images/home_5.webp"
                                alt="Candela Butter accesa accanto alla sua scatola bianca"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 40vw"
                            />
                        </motion.div>
                    </div>
                </div>

                <div className="md:col-span-6 md:col-start-7 md:pt-16">
                    <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.015em]">
                        Una candela alla volta.
                    </h2>
                    <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-fumo">
                        Coliamo ogni candela a mano, poche alla volta, con cera di soia pura. Ci prendiamo il tempo che serve, perché quello che mettiamo dentro è quello che senti quando la accendi.
                    </p>

                    <dl className="mt-12">
                        {principi.map((p) => (
                            <div key={p.titolo} className="grid grid-cols-1 gap-2 border-t border-fuliggine/15 py-6 sm:grid-cols-[13rem_1fr] sm:gap-6">
                                <dt className="font-serif text-xl">{p.titolo}</dt>
                                <dd className="max-w-[44ch] text-base leading-relaxed text-fumo">{p.testo}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
