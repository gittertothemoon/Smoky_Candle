"use client";

import { motion } from "framer-motion";
import { useMovimentoRidotto } from "@/lib/movimento";
import { PORTONE_D, PORTONE_VIEWBOX } from "@/components/home/portone";

/*
 * Il portone del marchio, dal tracciato originale di stampa.
 * All'apertura sale dal basso, un corso di mattoni alla volta;
 * a candela accesa le linee vicino alla fiamma prendono la sua luce.
 */

export const ASPETTO_PORTONE = "148.58 / 140.47";

interface ArcoProps {
    acceso: boolean;
    luce: string;
}

export default function Arco({ acceso, luce }: ArcoProps) {
    const ridotto = useMovimentoRidotto();

    return (
        <motion.svg
            viewBox={PORTONE_VIEWBOX}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
            initial={ridotto ? false : { clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
        >
            <defs>
                {/* la luce parte dalla fiamma, a metà dell'apertura */}
                <radialGradient id="luce-portone" cx="50%" cy="62%" r="62%">
                    <stop offset="0%" stopColor={luce} stopOpacity="1" />
                    <stop offset="45%" stopColor={luce} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={luce} stopOpacity="0" />
                </radialGradient>
            </defs>
            <path d={PORTONE_D} fill="rgba(245, 242, 238, 0.34)" />
            <path
                d={PORTONE_D}
                fill="url(#luce-portone)"
                style={{ opacity: acceso ? 1 : 0, transition: "opacity 1800ms cubic-bezier(0.22,0.61,0.36,1)" }}
            />
        </motion.svg>
    );
}
