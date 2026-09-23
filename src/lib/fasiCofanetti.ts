/*
 * La sezione dei cofanetti è una scena ferma guidata dallo scroll: questi sono i punti della corsa (0-1)
 * in cui succedono le cose. Li leggono sia la pagina (quale cofanetto è scelto) sia la scena 3D.
 */
export const FASI_COFANETTI = {
    /** il pack chiuso se ne va e arriva la seconda candela */
    sballa: [0, 0.12],
    /** si monta il cofanetto regalo: vassoio, carta velina, coperchio col nastro */
    regalo: [0.32, 0.48],
    /** si aggiunge il biglietto nella sua busta */
    biglietto: [0.62, 0.78],
} as const;

/** dove cambia il cofanetto scelto nell'elenco: a metà di ogni montaggio */
export const SOGLIE_COFANETTI = [0.4, 0.7] as const;

/** dove porta un tocco sull'elenco: a montaggio finito */
export const PUNTI_COFANETTI = [0.22, 0.56, 0.9] as const;
