"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crepitio } from "@/lib/crepitio";

export type StatoScatola = "chiusa" | "apertura" | "via";

/*
 * Lo stato della candela vive a livello di pagina: la candela 3D viaggia
 * per tutte le sezioni, i comandi stanno nell'apertura.
 */
export function useCandela() {
    const [acceso, setAcceso] = useState(false);
    const [spentaConSoffio, setSpentaConSoffio] = useState(false);
    const [ore, setOre] = useState(0);
    const [finita, setFinita] = useState(false);
    const [rinnovo, setRinnovo] = useState(0);
    const [girabile, setGirabile] = useState(false);
    const [scatola, setScatola] = useState<StatoScatola>("chiusa");
    const aperta = useCallback(() => setScatola("via"), []);

    // col mouse la candela si gira trascinandola; col dito si scorre la pagina
    useEffect(() => {
        const mq = window.matchMedia("(pointer: fine)");
        const aggiorna = () => setGirabile(mq.matches);
        aggiorna();
        mq.addEventListener("change", aggiorna);
        return () => mq.removeEventListener("change", aggiorna);
    }, []);

    // il crepitio dello stoppino: nasce col clic che accende, segue la fiamma
    const suono = useRef<Crepitio | null>(null);
    const [muto, setMuto] = useState(false);
    useEffect(() => {
        const c = suono.current;
        if (!c) return;
        if (acceso) c.avvia();
        else c.ferma();
    }, [acceso]);
    useEffect(() => {
        if (suono.current) suono.current.muto = muto;
    }, [muto]);
    useEffect(() => () => suono.current?.ferma(), []);
    const preparaSuono = useCallback(() => {
        if (!suono.current) suono.current = new Crepitio();
        suono.current.prepara();
    }, []);
    // il primo tocco sulla pagina sveglia l'audio (i browser lo permettono solo dentro un gesto):
    // così anche il coperchio tirato col mouse può fare il suo "pop"
    useEffect(() => {
        const sveglia = () => preparaSuono();
        window.addEventListener("pointerdown", sveglia, { once: true });
        window.addEventListener("keydown", sveglia, { once: true });
        return () => {
            window.removeEventListener("pointerdown", sveglia);
            window.removeEventListener("keydown", sveglia);
        };
    }, [preparaSuono]);

    // lo stato letto dentro i gesti, senza mettere effetti negli aggiornamenti di React
    const ora = useRef({ scatola, acceso });
    useEffect(() => {
        ora.current = { scatola, acceso };
    }, [scatola, acceso]);

    const apri = useCallback(() => {
        if (ora.current.scatola !== "chiusa") return;
        ora.current.scatola = "apertura";
        suono.current?.stappo();
        setScatola("apertura");
    }, []);

    const soffio = useCallback(() => {
        suono.current?.soffio();
        setAcceso(false);
        setSpentaConSoffio(true);
    }, []);
    // la scatola che si richiude la soffoca: niente soffio, solo il crepitio che si ferma
    const soffocata = useCallback(() => {
        if (!ora.current.acceso) return;
        ora.current.acceso = false;
        suono.current?.soffoca();
        setAcceso(false);
        setSpentaConSoffio(false);
    }, []);
    const finisce = useCallback(() => {
        setAcceso(false);
        setFinita(true);
    }, []);

    const alterna = useCallback(() => {
        if (finita) return;
        preparaSuono();
        setSpentaConSoffio(false);
        setAcceso((a) => !a);
    }, [finita, preparaSuono]);

    const nuovaCandela = useCallback(() => {
        preparaSuono();
        setFinita(false);
        setOre(0);
        setSpentaConSoffio(false);
        setRinnovo((n) => n + 1);
        setAcceso(true);
    }, [preparaSuono]);

    return {
        acceso,
        spentaConSoffio,
        ore,
        setOre,
        finita,
        rinnovo,
        girabile,
        scatola,
        apri,
        aperta,
        muto,
        setMuto,
        soffio,
        soffocata,
        finisce,
        alterna,
        nuovaCandela,
    };
}

export type Candela = ReturnType<typeof useCandela>;
