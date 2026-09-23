"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crepitio } from "@/lib/crepitio";

export type StatoScatola = "chiusa" | "apertura" | "via";
/** Il tappo a vite del vasetto: c'è finché non lo sviti, poi vola via. */
export type StatoTappo = "su" | "svitando" | "via";

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
    const [tappo, setTappo] = useState<StatoTappo>("su");
    const tolto = useCallback(() => setTappo("via"), []);

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
    const ora = useRef({ scatola, acceso, tappo });
    useEffect(() => {
        ora.current = { scatola, acceso, tappo };
    }, [scatola, acceso, tappo]);

    const apri = useCallback(() => {
        if (ora.current.scatola !== "chiusa") return;
        ora.current.scatola = "apertura";
        // il "pop" lo chiede la scatola nel fotogramma in cui il coperchio si stacca
        setScatola("apertura");
    }, []);

    // si svita solo a pack aperto: prima il tappo sta dentro la scatola
    const stappa = useCallback(() => {
        if (ora.current.scatola !== "via" || ora.current.tappo !== "su") return;
        ora.current.tappo = "svitando";
        preparaSuono();
        // gli scatti e il "tin" li chiede il tappo mentre gira
        setTappo("svitando");
    }, [preparaSuono]);

    // il pack finito di aprire; se la candela andava scoperta da sola, ora tocca al tappo
    const vuoleStappo = useRef(false);
    const aperta = useCallback(() => {
        ora.current.scatola = "via";
        setScatola("via");
        if (vuoleStappo.current) {
            vuoleStappo.current = false;
            // un respiro fra il pack che se ne va e il tappo che gira: due gesti, non uno solo
            setTimeout(stappa, 350);
        }
    }, [stappa]);

    /*
     * Arrivando alle fragranze la candela dev'essere scoperta, qualunque cosa uno abbia fatto sopra:
     * pack chiuso -> si apre e poi si svita il tappo; pack aperto -> si svita il tappo; già scoperta -> niente.
     * Così nei cofanetti si parte sempre dal vasetto nudo, e il tappo e il pack si rimettono nell'ordine giusto.
     */
    const scopri = useCallback(() => {
        const s = ora.current.scatola;
        if (s === "chiusa") {
            vuoleStappo.current = true;
            apri();
        } else if (s === "apertura") {
            vuoleStappo.current = true;
        } else {
            stappa();
        }
    }, [apri, stappa]);

    // i suoni li decide l'animazione 3D, nel fotogramma giusto
    const suona = useCallback((s: "stappo" | "scatto" | "tin") => {
        const c = suono.current;
        if (!c) return;
        if (s === "stappo") c.stappo();
        else if (s === "scatto") c.scatto();
        else c.tin();
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
        tappo,
        stappa,
        tolto,
        scopri,
        suona,
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
