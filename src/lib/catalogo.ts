export type Atmosfera = "butter" | "berry";
export type CofanettoScelto = "duo" | "cofanetto-regalo" | "discovery-box";

export interface Articolo {
    id: string;
    nome: string;
    prezzo: number;
    immagine: string;
}

export interface Fragranza extends Articolo {
    atmosfera: Atmosfera;
    descrizione: string;
    note: string;
}

export interface Cofanetto extends Articolo {
    id: CofanettoScelto;
    descrizione: string;
}

export const fragranze: Fragranza[] = [
    {
        id: "butter",
        atmosfera: "butter",
        nome: "Butter",
        prezzo: 34,
        immagine: "/images/butter.webp",
        descrizione:
            "Vaniglia bourbon, burro caldo, una scia di cedro sul fondo. La fragranza che chiama il divano, una coperta e le sere lunghe.",
        note: "Vaniglia, burro fuso, legno di cedro",
    },
    {
        id: "berry",
        atmosfera: "berry",
        nome: "Berry",
        prezzo: 34,
        immagine: "/images/berry.webp",
        descrizione:
            "Frutti di bosco appena colti, rosa damascena e muschio bianco. Fresca e leggera, per le mattine con le finestre aperte.",
        note: "Frutti di bosco, rosa damascena, muschio bianco",
    },
];

export const cofanetti: Cofanetto[] = [
    {
        id: "duo",
        nome: "Duo",
        prezzo: 58,
        immagine: "/images/cofanetto-duo.webp",
        descrizione:
            "Butter e Berry insieme, per chi non vuole scegliere. O per regalarne una e tenere l'altra.",
    },
    {
        id: "cofanetto-regalo",
        nome: "Cofanetto regalo",
        prezzo: 62,
        immagine: "/images/cofanetto-cofanetto-regalo.webp",
        descrizione:
            "Le due candele in una scatola rigida nera, già pronta da regalare così com'è.",
    },
    {
        id: "discovery-box",
        nome: "Discovery Box",
        prezzo: 65,
        immagine: "/images/cofanetto-discovery-box.webp",
        descrizione:
            "Il cofanetto regalo con un biglietto scritto a mano, nella sua busta. Per quando vuoi aggiungere due parole tue.",
    },
];

/** Scena del riquadro ad arco in apertura, una per atmosfera. */
export const scene: Record<Atmosfera, { immagine: string; alt: string; riga: string }> = {
    butter: {
        immagine: "/images/hero_6.webp",
        alt: "Candela Butter davanti a un muro di mattoni",
        riga: "Vaniglia bourbon, burro caldo, cedro.",
    },
    berry: {
        immagine: "/images/hero_4.webp",
        alt: "Candela Berry su una pietra, con mirtilli",
        riga: "Frutti di bosco, rosa damascena, muschio bianco.",
    },
};

export const EMAIL_ORDINI = "info@smokycandle.it";
