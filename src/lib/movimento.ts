"use client";

import { useSyncExternalStore } from "react";

/*
 * "Riduci movimento" letto in modo sicuro per l'idratazione: il server e il primo
 * render del client vedono false, poi React passa al valore vero del telefono.
 * (useReducedMotion di framer legge subito il valore e su iPhone fa divergere il testo)
 */
const query = "(prefers-reduced-motion: reduce)";

function iscrivi(avvisa: () => void) {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", avvisa);
    return () => mq.removeEventListener("change", avvisa);
}

export function useMovimentoRidotto() {
    return useSyncExternalStore(
        iscrivi,
        () => window.matchMedia(query).matches,
        () => false
    );
}
