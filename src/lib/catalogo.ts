export type Atmosfera = "butter" | "berry";

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
            "Frutti di bosco appena raccolti, rosa damascena, muschio bianco. Apre la stanza con leggerezza, lascia respirare l'aria.",
        note: "Frutti di bosco, rosa damascena, muschio bianco",
    },
];

export const cofanetti: Cofanetto[] = [
    {
        id: "duo",
        nome: "Duo",
        prezzo: 58,
        immagine: "/images/bundle_1.webp",
        descrizione:
            "Butter e Berry, una accanto all'altra. Per chi non vuole scegliere tra le due atmosfere.",
    },
    {
        id: "cofanetto-regalo",
        nome: "Cofanetto regalo",
        prezzo: 62,
        immagine: "/images/bundle_2.webp",
        descrizione:
            "Le due fragranze in una scatola rigida nera. Arriva pronta da consegnare, senza incarto da aggiungere.",
    },
    {
        id: "discovery-box",
        nome: "Discovery Box",
        prezzo: 65,
        immagine: "/images/bundle_3.webp",
        descrizione:
            "Il Duo con un biglietto scritto a mano. Per quando un regalo deve dire qualcosa di tuo.",
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
