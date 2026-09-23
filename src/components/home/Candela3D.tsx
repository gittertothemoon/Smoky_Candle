"use client";

// three.js vive di oggetti mutati a ogni frame dentro useFrame: è il modello di R3F, non un errore
/* eslint-disable react-hooks/immutability */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import type { Atmosfera } from "@/lib/catalogo";

/*
 * La candela vera, in WebGL: barattolo in vetro ambrato, cera di soia,
 * stoppino in legno, etichetta col logo. La fiamma è una luce che illumina
 * il vetro; mentre brucia la cera cala (40 ore compresse in due minuti).
 */

export const ORE_TOTALI = 40;
const SECONDI_PER_ORA = 3;

// Misure prese dalle foto del vasetto vero (IMG_6016): alto 1,43 volte la larghezza,
// collo filettato appena più stretto del corpo, fondo di vetro spesso
const R_VETRO = 0.75;
const H_VETRO = 2.15;
const FONDO = 0.12;
const R_INTERNO = 0.69;
const CERA_MAX = 1.66;
const CERA_MIN = 0.12;

const TINTE: Record<Atmosfera, { luce: string; punta: THREE.Color }> = {
    butter: { luce: "#ffd6a8", punta: new THREE.Color("#e0621e") },
    berry: { luce: "#ffd0c4", punta: new THREE.Color("#d2344f") },
};

/* ---------- la fiamma: una goccia di luce disegnata in shader ---------- */

const fiammaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fiammaFragment = /* glsl */ `
uniform float uTempo;
uniform float uVento;
uniform float uLuce;
uniform vec3 uPunta;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float y = uv.y;
  // turbolenza che sale: più forte verso la punta
  float t = uTempo;
  float n = fbm(vec2(uv.x * 3.0, y * 4.0 - t * 2.6));
  float scossa = (n - 0.5) * 0.22 * pow(y, 1.4);
  float x = uv.x - 0.5 - scossa - uVento * 0.3 * y * y;
  // respiro in altezza
  float alt = 0.86 + 0.08 * sin(t * 9.1) + 0.05 * sin(t * 15.7 + 1.3);
  float yy = y / alt;
  // profilo a goccia
  float larghezza = 0.2 * pow(max(sin(3.14159 * pow(clamp(yy, 0.0, 1.0), 0.58)), 0.0), 1.2);
  float d = abs(x) / max(larghezza, 0.0005);
  float fuori = 1.0 - smoothstep(0.55, 1.0, d);
  fuori *= smoothstep(0.0, 0.06, yy) * (1.0 - smoothstep(0.78, 1.0, yy + (n - 0.5) * 0.25));
  float cuore = (1.0 - smoothstep(0.0, 0.5, d)) * smoothstep(0.08, 0.2, yy) * (1.0 - smoothstep(0.35, 0.62, yy));
  float base = (1.0 - smoothstep(0.02, 0.2, yy)) * (1.0 - smoothstep(0.3, 1.0, d));

  vec3 arancio = vec3(1.0, 0.55, 0.14);
  vec3 giallo = vec3(1.0, 0.82, 0.42);
  vec3 colore = mix(giallo, arancio, smoothstep(0.25, 0.7, d + yy * 0.4));
  colore = mix(colore, uPunta, smoothstep(0.55, 0.95, yy));
  colore = mix(colore, vec3(1.0, 0.98, 0.9), cuore * 0.9);
  colore = mix(colore, vec3(0.28, 0.42, 1.0), base * 0.7);

  float alfa = clamp(max(fuori, base * 0.6) * uLuce, 0.0, 1.0);
  gl_FragColor = vec4(colore * alfa * 1.8, alfa);
}`;

const alonFragment = /* glsl */ `
uniform float uLuce;
uniform vec3 uColore;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 2.6) * uLuce;
  gl_FragColor = vec4(uColore * a, a);
}`;

/* ---------- il fumo: punti morbidi che salgono a riccioli ---------- */

const fumoVertex = /* glsl */ `
attribute float aVita;
attribute float aSize;
varying float vVita;
void main() {
  vVita = aVita;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (140.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const fumoFragment = /* glsl */ `
varying float vVita;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.0, 1.0, d));
  float entra = smoothstep(0.0, 0.08, vVita);
  float esce = 1.0 - smoothstep(0.15, 1.0, vVita);
  gl_FragColor = vec4(vec3(0.78, 0.76, 0.74), a * a * entra * esce * 0.13);
}`;

const N_FUMO = 220;

const limita = (x: number, a = 0, b = 1) => Math.min(Math.max(x, a), b);

/*
 * La chiusura nei cofanetti va in due tempi, come si fa davvero: prima il vasetto si avvita il suo tappo
 * (il primo 45% della corsa), poi il pack scende e lo chiude (il resto).
 */
const faseTappo = (r: number) => limita(r / 0.45);
const faseScatola = (r: number) => limita((r - 0.45) / 0.55);

/*
 * Il vetro rifrange una foto della scena scattata su un render target. Quello che sta FUORI
 * dal vetro (etichetta, scatola) non deve finirci, se no compare sul vetro come un fantasma:
 * quando si disegna su un render target, questi oggetti non disegnano niente.
 */
function fuoriDalVetro(mesh: THREE.Mesh | null) {
    if (!mesh || mesh.userData.fuoriDalVetro) return;
    mesh.userData.fuoriDalVetro = true;
    mesh.onBeforeRender = (renderer) => {
        if (renderer.getRenderTarget()) mesh.geometry.setDrawRange(0, 0);
    };
    mesh.onAfterRender = () => {
        mesh.geometry.setDrawRange(0, Infinity);
    };
}

// quello che il vetro vede dietro di sé: lo stesso buio caldo della pagina
const SFONDO_VETRO = new THREE.Color("#231b17");

/* ---------- l'etichetta: quella vera, dai file di stampa ---------- */

// larghezza/altezza delle etichette di stampa (PDF in bobina, fogra39), ritagliate dentro il bordo verde
const ETICHETTE: Record<Atmosfera, { file: string; aspetto: number }> = {
    butter: { file: "/images/etichetta-butter.webp", aspetto: 1.343 },
    berry: { file: "/images/etichetta-berry.webp", aspetto: 1.343 },
};
// sulla foto l'etichetta copre circa 138 gradi di vetro, è alta il 63% e parte al 15% dell'altezza
const ARCO_ETICHETTA = 2.4;
const R_ETICHETTA = R_VETRO + 0.006;

function useEtichette() {
    const [texture, setTexture] = useState<Partial<Record<Atmosfera, THREE.Texture>>>({});

    useEffect(() => {
        let annullato = false;
        const caricate: THREE.Texture[] = [];
        (Object.keys(ETICHETTE) as Atmosfera[]).forEach((a) => {
            new THREE.TextureLoader().load(ETICHETTE[a].file, (t) => {
                caricate.push(t);
                if (annullato) return;
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = 8;
                setTexture((prima) => ({ ...prima, [a]: t }));
            });
        });
        return () => {
            annullato = true;
            caricate.forEach((t) => t.dispose());
        };
    }, []);

    return texture;
}

/* ---------- la scatola a tubo: il pack vero, che apri tu ---------- */

// dalle foto (IMG_5249): tubo alto 1,5 volte la larghezza, coperchio al 71%, logo davanti al 58% del coperchio
const R_SCATOLA = 0.83;
const H_SCATOLA = 2 * R_SCATOLA * 1.5;
const H_COPERCHIO = H_SCATOLA * 0.71;
const H_BASE = H_SCATOLA - H_COPERCHIO;
const CARTONE = 0.018;
const COLLARINO = 0.34;
const BIANCO = "#f4f2ee";

export type StatoScatola = "chiusa" | "apertura" | "via";
export type StatoTappo = "su" | "svitando" | "via";

/*
 * Il logo del pack: l'etichetta di stampa senza il nome della fragranza, in grigio come sulla scatola vera.
 * È un'immagine già pronta (public/images/scatola-coperchio.webp): costruirla nel browser voleva dire
 * una tela da 4096 px ripassata pixel per pixel, e sull'iPhone il pack arrivava dopo la candela.
 * Una sola texture per tutta la pagina: la usano la scatola dell'apertura e quella dei cofanetti.
 */
let texturaScatola: THREE.Texture | null = null;
let caricamentoScatola: Promise<THREE.Texture> | null = null;
function caricaTexturaScatola() {
    caricamentoScatola ??= new Promise((ok) => {
        new THREE.TextureLoader().load("/images/scatola-coperchio.webp", (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 8;
            texturaScatola = t;
            ok(t);
        });
    });
    return caricamentoScatola;
}
function useTexturaScatola() {
    const [texture, setTexture] = useState<THREE.Texture | null>(texturaScatola);
    useEffect(() => {
        let annullato = false;
        caricaTexturaScatola().then((t) => {
            if (!annullato) setTexture(t);
        });
        return () => {
            annullato = true;
        };
    }, []);
    return texture;
}

/** Dove sta la candela sullo schermo, in pixel: serve a capire se il puntatore la tocca. */
export interface Schermo {
    cx: number;
    cy: number;
    h: number;
    /** l'angolo in alto a sinistra della tela sullo schermo (sul telefono la tela non parte da 0,0) */
    ox: number;
    oy: number;
}

function sopraLaCandela(x: number, y: number, s: Schermo, larghezza = 0.36) {
    return Math.abs(x - s.cx) < s.h * larghezza && Math.abs(y - s.cy) < s.h * 0.55;
}

export type Suono = "stappo" | "scatto" | "tin";

interface ScatolaProps {
    stato: StatoScatola;
    onApri: () => void;
    onAperta: () => void;
    onSuono: (s: Suono) => void;
    schermo: React.RefObject<Schermo>;
    /** Se c'è, la scatola si richiude seguendo lo scroll (0 aperta, 1 chiusa). */
    chiusura?: React.RefObject<number>;
}

function Scatola({ stato, onApri, onAperta, onSuono, schermo, chiusura }: ScatolaProps) {
    const textura = useTexturaScatola();
    const coperchio = useRef<THREE.Group>(null);
    const base = useRef<THREE.Group>(null);
    const materiali = useRef<THREE.MeshStandardMaterial[]>([]);
    const tiro = useRef({ attivo: false, y0: 0, valore: 0, rilascio: 0 });
    const apertura = useRef<number | null>(null);
    const chiusa = useRef(false);
    const cb = useRef({ stato, onApri, onAperta, onSuono });
    useEffect(() => {
        cb.current = { stato, onApri, onAperta, onSuono };
    }, [stato, onApri, onAperta, onSuono]);
    const stappata = useRef(false);

    // col mouse si afferra il coperchio e si tira su; un tocco o un clic la aprono
    useEffect(() => {
        if (chiusura) return;
        const tela = window;
        const giu = (e: PointerEvent) => {
            if (cb.current.stato !== "chiusa") return;
            if (!sopraLaCandela(e.clientX, e.clientY, schermo.current, 0.4)) return;
            tiro.current.attivo = true;
            tiro.current.y0 = e.clientY;
            tiro.current.rilascio = performance.now();
            if (e.pointerType === "mouse") e.preventDefault();
        };
        const muovi = (e: PointerEvent) => {
            if (!tiro.current.attivo || e.pointerType !== "mouse") return;
            const su = Math.max(0, tiro.current.y0 - e.clientY);
            // resistenza del cartone: il coperchio viene su a fatica, poi si stacca
            tiro.current.valore = Math.min(1, su / 160);
            if (tiro.current.valore >= 1) {
                tiro.current.attivo = false;
                cb.current.onApri();
            }
        };
        const su = (e: PointerEvent) => {
            if (!tiro.current.attivo) return;
            tiro.current.attivo = false;
            const breve = performance.now() - tiro.current.rilascio < 250 && tiro.current.valore < 0.1;
            if (breve || tiro.current.valore > 0.45 || e.pointerType !== "mouse") cb.current.onApri();
        };
        tela.addEventListener("pointerdown", giu);
        tela.addEventListener("pointermove", muovi);
        tela.addEventListener("pointerup", su);
        tela.addEventListener("pointercancel", su);
        return () => {
            tela.removeEventListener("pointerdown", giu);
            tela.removeEventListener("pointermove", muovi);
            tela.removeEventListener("pointerup", su);
            tela.removeEventListener("pointercancel", su);
        };
    }, [chiusura, schermo]);

    const tutto = useRef<THREE.Group>(null);

    useFrame(({ clock }, delta) => {
        if (!textura) return;
        if (chiusura) {
            // richiusa dallo scroll: la base c'è già, piena, sotto il vasetto (la candela ci è appoggiata);
            // il coperchio scende dall'alto, pieno, e la chiude. Niente pezzi semitrasparenti.
            const r = faseScatola(chiusura.current);
            const k = 1 - r;
            if (tutto.current) tutto.current.visible = chiusura.current > 0.01;
            if (coperchio.current) {
                const y = k * k * 3.4;
                coperchio.current.position.y = y;
                // il bordo del coperchio supera la cima del vasetto a y ≈ 1.5: sotto quella quota scende dritto
                const libero = limita((y - 1.6) / 1.6);
                coperchio.current.rotation.x = -libero * 0.4;
                coperchio.current.rotation.z = libero * 0.14;
            }
            if (base.current) {
                // compare in un attimo crescendo appena, ferma sotto il vasetto: non sale sul testo
                const cresce = limita(chiusura.current / 0.12);
                base.current.position.y = 0;
                base.current.scale.set(0.9 + cresce * 0.1, cresce, 0.9 + cresce * 0.1);
            }
            for (const m of materiali.current) {
                m.opacity = 1;
                m.transparent = false;
                m.depthWrite = true;
            }
            return;
        }
        if (chiusa.current) return;
        const t = clock.elapsedTime;
        const dt = Math.min(delta, 0.05);
        const c = coperchio.current;
        const b = base.current;
        if (!c || !b) return;

        if (cb.current.stato === "chiusa") {
            // mentre tiri: il coperchio sale al massimo di un dito; lasciato, torna giù
            if (!tiro.current.attivo) tiro.current.valore += (0 - tiro.current.valore) * Math.min(dt * 8, 1);
            const invito = Math.max(0, Math.sin(t * 1.6)) ** 8 * 0.035;
            const alzata = Math.pow(tiro.current.valore, 1.6) * 0.22 + invito;
            c.position.y = alzata;
            c.rotation.z = tiro.current.valore * 0.02;
            return;
        }

        if (apertura.current === null) apertura.current = t;
        const x = t - apertura.current;
        // il cartone fa resistenza: il coperchio sale di un dito, si stacca col "pop" (il suono parte da qui,
        // nel fotogramma in cui si stacca), poi vola via in alto ruotando; la base scende; poi svaniscono
        const esce = (k: number) => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 3);
        const STRAPPO = 0.3;
        const partenza = c.position.y;
        const y = x < STRAPPO ? 0.08 * morbido(x / STRAPPO) : 0.08 + esce((x - STRAPPO) / 1.05) * 3.3;
        c.position.y = Math.max(partenza, y);
        if (x >= STRAPPO && !stappata.current) {
            stappata.current = true;
            cb.current.onSuono("stappo");
        }
        // s'inclina solo quando ha lasciato il vasetto, se no gli passerebbe attraverso
        const libero = limita((c.position.y - 1.6) / 1.6);
        c.rotation.x = -libero * 0.5;
        c.rotation.z = libero * 0.18;
        b.position.y = -esce((x - 0.55) / 1.2) * 2.2;
        const svanisce = 1 - Math.min(Math.max((x - 0.85) / 0.75, 0), 1);
        for (const m of materiali.current) {
            m.opacity = svanisce;
            m.transparent = svanisce < 0.999;
        }
        if (x > 1.65) {
            chiusa.current = true;
            cb.current.onAperta();
        }
    });

    if (!textura) return null;
    const registra = (m: THREE.MeshStandardMaterial | null) => {
        if (m && !materiali.current.includes(m)) materiali.current.push(m);
    };
    // la carta bianca resta bianca anche al buio: un filo di luce propria, come sotto un faretto
    const carta = { roughness: 0.92, transparent: true, emissive: BIANCO, emissiveIntensity: 0.3 } as const;
    const interno = { roughness: 1, transparent: true, color: "#d9d3cb", emissive: "#d9d3cb", emissiveIntensity: 0.12 } as const;

    return (
        <group ref={tutto} position={[0, -0.04, 0]}>
            <group ref={base}>
                {/* il fondo e la parete esterna della base */}
                <mesh ref={fuoriDalVetro} position={[0, H_BASE / 2, 0]} renderOrder={7}>
                    <cylinderGeometry args={[R_SCATOLA, R_SCATOLA, H_BASE, 128]} />
                    <meshStandardMaterial ref={registra} color="#f1efeb" {...carta} />
                </mesh>
                {/* il collarino interno su cui s'infila il coperchio */}
                <mesh ref={fuoriDalVetro} position={[0, H_BASE + COLLARINO / 2 - 0.01, 0]} renderOrder={7}>
                    <cylinderGeometry args={[R_SCATOLA - CARTONE, R_SCATOLA - CARTONE, COLLARINO, 128, 1, true]} />
                    <meshStandardMaterial ref={registra} color={BIANCO} {...carta} />
                </mesh>
                <mesh ref={fuoriDalVetro} position={[0, H_BASE + COLLARINO / 2 - 0.01, 0]} renderOrder={7}>
                    <cylinderGeometry args={[R_SCATOLA - 2 * CARTONE, R_SCATOLA - 2 * CARTONE, COLLARINO, 128, 1, true]} />
                    <meshStandardMaterial ref={registra} side={THREE.BackSide} {...interno} />
                </mesh>
                <mesh ref={fuoriDalVetro} position={[0, H_BASE + COLLARINO - 0.01, 0]} rotation-x={-Math.PI / 2} renderOrder={7}>
                    <ringGeometry args={[R_SCATOLA - 2 * CARTONE, R_SCATOLA - CARTONE, 128]} />
                    <meshStandardMaterial ref={registra} color="#e7e2da" {...carta} emissiveIntensity={0.2} />
                </mesh>
            </group>

            <group ref={coperchio}>
                {/* la parete stampata */}
                <mesh ref={fuoriDalVetro} position={[0, H_BASE + (H_COPERCHIO - CARTONE) / 2, 0]} renderOrder={7}>
                    <cylinderGeometry
                        args={[R_SCATOLA, R_SCATOLA, H_COPERCHIO - CARTONE, 128, 1, true, -Math.PI, Math.PI * 2]}
                    />
                    <meshStandardMaterial ref={registra} map={textura} emissiveMap={textura} {...carta} />
                </mesh>
                {/* lo spessore del cartone sul bordo in basso, e la parete interna */}
                <mesh ref={fuoriDalVetro} position={[0, H_BASE, 0]} rotation-x={Math.PI / 2} renderOrder={7}>
                    <ringGeometry args={[R_SCATOLA - CARTONE, R_SCATOLA, 128]} />
                    <meshStandardMaterial ref={registra} color="#e3ddd4" {...carta} emissiveIntensity={0.15} />
                </mesh>
                <mesh ref={fuoriDalVetro} position={[0, H_BASE + H_COPERCHIO / 2, 0]} renderOrder={7}>
                    <cylinderGeometry args={[R_SCATOLA - CARTONE, R_SCATOLA - CARTONE, H_COPERCHIO, 128, 1, true]} />
                    <meshStandardMaterial ref={registra} side={THREE.BackSide} {...interno} />
                </mesh>
                {/* il bordo arrotondato e il tappo */}
                <mesh ref={fuoriDalVetro} position={[0, H_SCATOLA - CARTONE, 0]} rotation-x={Math.PI / 2} renderOrder={7}>
                    <torusGeometry args={[R_SCATOLA - CARTONE, CARTONE, 12, 128]} />
                    <meshStandardMaterial ref={registra} color={BIANCO} {...carta} />
                </mesh>
                <mesh ref={fuoriDalVetro} position={[0, H_SCATOLA, 0]} rotation-x={-Math.PI / 2} renderOrder={7}>
                    <circleGeometry args={[R_SCATOLA - CARTONE, 128]} />
                    <meshStandardMaterial ref={registra} color={BIANCO} {...carta} />
                </mesh>
            </group>
        </group>
    );
}

/* ---------- il tappo a vite: nero su Berry, oro su Butter, identico per il resto ---------- */

// dalla foto del tappo vero: disco piatto, fascia zigrinata, bordino arrotolato in fondo; copre la filettatura
const R_TAPPO = 0.757;
const H_TAPPO = 0.3;
// il disco interno del tappo (spesso 0,02) appoggia sul labbro del vetro: più in basso il labbro lo buca e fa un cerchio scuro
const SEDE_TAPPO = H_VETRO + 0.022;

interface TappoProps {
    atmosfera: Atmosfera;
    chiusura: React.RefObject<number>;
    /** nell'apertura: il tappo c'è finché non lo sviti */
    stato: StatoTappo;
    /** il pack è ancora chiuso o si sta aprendo: il tappo non si tocca */
    inScatola: boolean;
    schermo: React.RefObject<Schermo>;
    onStappa: () => void;
    onTolto: () => void;
    onSuono: (s: Suono) => void;
}

function Tappo({ atmosfera, chiusura, stato, inScatola, schermo, onStappa, onTolto, onSuono }: TappoProps) {
    const g = useRef<THREE.Group>(null);
    const cb = useRef({ stato, inScatola, onStappa, onTolto, onSuono });
    useEffect(() => {
        cb.current = { stato, inScatola, onStappa, onTolto, onSuono };
    }, [stato, inScatola, onStappa, onTolto, onSuono]);
    const inizio = useRef<number | null>(null);
    // i suoni seguono il tappo: uno scatto a ogni quarto di giro, il "tin" quando si stacca
    const giro = useRef({ quarti: 0, staccato: false });

    // un tocco o un clic sulla candela (senza trascinare) svita il tappo
    useEffect(() => {
        const giu = { x: 0, y: 0, t: 0, sopra: false };
        const premi = (e: PointerEvent) => {
            giu.sopra = sopraLaCandela(e.clientX, e.clientY, schermo.current, 0.4);
            giu.x = e.clientX;
            giu.y = e.clientY;
            giu.t = performance.now();
        };
        const lascia = (e: PointerEvent) => {
            const c = cb.current;
            if (!giu.sopra || c.stato !== "su" || c.inScatola) return;
            if (performance.now() - giu.t > 350 || Math.hypot(e.clientX - giu.x, e.clientY - giu.y) > 10) return;
            c.onStappa();
        };
        window.addEventListener("pointerdown", premi);
        window.addEventListener("pointerup", lascia);
        return () => {
            window.removeEventListener("pointerdown", premi);
            window.removeEventListener("pointerup", lascia);
        };
    }, [schermo]);

    const corpo = useMemo(() => {
        const p = (r: number, y: number) => new THREE.Vector2(r, y);
        const b = -H_TAPPO;
        return new THREE.LatheGeometry(
            [
                p(0, 0),
                // il bordo del disco è una curva morbida, non uno smusso: un gradino stretto rifletteva il buio e faceva una riga nera
                ...Array.from({ length: 7 }, (_, i) => {
                    const a = (i / 6) * (Math.PI / 2);
                    return p(R_TAPPO - 0.03 + Math.sin(a) * 0.03, -0.03 + Math.cos(a) * 0.03);
                }),
                p(R_TAPPO, -0.045),
                p(R_TAPPO, b + 0.06),
                // il bordino arrotolato, appena più largo
                p(R_TAPPO + 0.014, b + 0.045),
                p(R_TAPPO + 0.016, b + 0.02),
                p(R_TAPPO + 0.006, b),
                p(0.742, b),
                p(0.742, -0.02),
                p(0, -0.02),
            ],
            160
        );
    }, []);

    // la zigrinatura: una fascia di righe verticali fitte, fatta alternando il raggio
    const zigrino = useMemo(() => {
        const geo = new THREE.CylinderGeometry(R_TAPPO, R_TAPPO, H_TAPPO - 0.13, 360, 1, true);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const k = 1 + (Math.round((a / (Math.PI * 2)) * 360) % 2 === 0 ? 0.008 : 0);
            pos.setXYZ(i, x * k, pos.getY(i), z * k);
        }
        geo.computeVertexNormals();
        geo.translate(0, -0.045 - (H_TAPPO - 0.13) / 2, 0);
        return geo;
    }, []);

    const materiali = useMemo(
        () => ({
            // nero satinato: al buio si legge dai riflessi, non dal colore
            berry: new THREE.MeshStandardMaterial({ color: "#1b1a1a", metalness: 0.55, roughness: 0.38, envMapIntensity: 1.3 }),
            // l'oro puro al buio riflette solo il buio: il disco piatto in cima veniva un cerchio nero.
            // Metà metallo e una luce propria calda: dorato ovunque, coi riflessi che corrono sulla zigrinatura
            butter: new THREE.MeshStandardMaterial({
                color: "#d6ae5c",
                metalness: 0.45,
                roughness: 0.36,
                envMapIntensity: 1.6,
                emissive: "#7a5620",
                emissiveIntensity: 0.55,
            }),
        }),
        []
    );
    useEffect(() => () => Object.values(materiali).forEach((m) => m.dispose()), [materiali]);

    useFrame(({ clock }) => {
        const t = g.current;
        if (!t) return;
        const c = cb.current;
        const m = materiali[atmosfera];
        m.opacity = 1;
        m.transparent = false;
        t.rotation.x = 0;
        t.rotation.z = 0;

        // scorrendo veloce il pack dei cofanetti arriva prima che il tappo abbia finito: si chiude di colpo
        if (c.stato === "svitando" && chiusura.current > 0.001) {
            inizio.current = null;
            c.onTolto();
        }
        if (c.stato === "svitando" && chiusura.current < 0.001) {
            // due giri al contrario salendo del passo, poi si stacca e vola via come il coperchio del pack
            if (inizio.current === null) {
                inizio.current = clock.elapsedTime;
                giro.current = { quarti: 0, staccato: false };
            }
            const x = clock.elapsedTime - inizio.current;
            // parte piano, gira, rallenta: due giri al contrario in 1,1 secondi
            const s = morbido(x / 1.1);
            const l = limita((x - 1.1) / 0.9);
            const vola = 1 - Math.pow(1 - l, 3);
            const quarti = Math.floor(s * 8);
            if (quarti > giro.current.quarti && quarti < 8) {
                giro.current.quarti = quarti;
                c.onSuono("scatto");
            }
            if (l > 0 && !giro.current.staccato) {
                giro.current.staccato = true;
                c.onSuono("tin");
            }
            t.visible = true;
            t.position.y = SEDE_TAPPO + 0.05 * s + vola * 1.9;
            t.rotation.y = s * Math.PI * 4 + l * 0.6;
            t.rotation.x = -vola * 0.45;
            t.rotation.z = vola * 0.2;
            const svanisce = 1 - limita((x - 1.5) / 0.5);
            m.opacity = svanisce;
            m.transparent = svanisce < 0.999;
            if (x > 2.05) {
                inizio.current = null;
                c.onTolto();
            }
            return;
        }
        // tappo mai svitato: resta avvitato, anche mentre il pack lo richiude
        const k = c.stato === "via" ? faseTappo(chiusura.current) : 1;
        t.visible = k > 0.001;
        // scende dritto fino a poggiare sulla filettatura, poi tre giri in senso orario e cala del passo
        const scende = limita(k / 0.55);
        const avvita = limita((k - 0.55) / 0.45);
        const giu = 1 - scende;
        t.position.y = SEDE_TAPPO + 0.05 * (1 - avvita) + giu * giu * 1.6;
        t.rotation.y = -avvita * Math.PI * 6 - giu * 0.8;
    });

    const m = materiali[atmosfera];
    return (
        <group ref={g} visible={false}>
            <mesh ref={fuoriDalVetro} geometry={corpo} material={m} renderOrder={7} />
            <mesh ref={fuoriDalVetro} geometry={zigrino} material={m} renderOrder={7} />
        </group>
    );
}

/* ---------- la scena ---------- */

interface ScenaProps {
    schermo: React.RefObject<Schermo>;
    chiusura: React.RefObject<number>;
    scatola: StatoScatola;
    onApri: () => void;
    onAperta: () => void;
    tappo: StatoTappo;
    onStappa: () => void;
    onTolto: () => void;
    onSuono: (s: Suono) => void;
    /** tutto caricato (etichetta e, se serve, il pack): la tela può comparire */
    onPronta?: () => void;
    acceso: boolean;
    atmosfera: Atmosfera;
    rinnovo: number;
    onSoffio: () => void;
    /** Il coperchio che si richiude soffoca la fiamma. */
    onSoffocata: () => void;
    onOre: (ore: number) => void;
    onFinita: () => void;
}

// sul telefono si risparmia: meno passaggi del vetro, meno pixel
const leggero = typeof window !== "undefined" && window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

function Scena({ schermo, chiusura, scatola, onApri, onAperta, tappo, onStappa, onTolto, onSuono, onPronta, acceso, atmosfera, rinnovo, onSoffio, onSoffocata, onOre, onFinita }: ScenaProps) {
    const { camera, size } = useThree();
    const etichetta = useEtichette()[atmosfera];
    // la candela non si mostra a metà: vasetto, etichetta e pack arrivano insieme
    const texturaPack = useTexturaScatola();
    const pronta = !!etichetta && (scatola === "via" || !!texturaPack);
    useEffect(() => {
        if (pronta) onPronta?.();
    }, [pronta, onPronta]);
    const hEtichetta = (R_ETICHETTA * ARCO_ETICHETTA) / ETICHETTE[atmosfera].aspetto;

    const cera = useRef<THREE.Mesh>(null);
    const pozza = useRef<THREE.Mesh>(null);
    const stoppino = useRef<THREE.Group>(null);
    const fiamma = useRef<THREE.Group>(null);
    const luce = useRef<THREE.PointLight>(null);
    const ceraMat = useRef<THREE.MeshStandardMaterial>(null);
    // il materiale di drei ha un tipo suo: qui serve solo l'emissive, comune a tutti i materiali fisici
    const vetroMat = useRef<{ emissiveIntensity: number } | null>(null);
    // R3F copia le uniform nel materiale: si aggiornano sul materiale vero, non sull'oggetto passato
    const matFiamma = useRef<THREE.ShaderMaterial>(null);
    const matAlone = useRef<THREE.ShaderMaterial>(null);

    const stato = useRef({ luce: 0, ore: 0, vento: 0, oreDette: -1, finita: false, fumoFino: 0, eraAcceso: false });
    const puntatore = useRef({ x: 0, y: 0, vel: 0, t: 0, noto: false });
    const callback = useRef({ onSoffio, onSoffocata, onOre, onFinita, acceso, atmosfera });
    useEffect(() => {
        callback.current = { onSoffio, onSoffocata, onOre, onFinita, acceso, atmosfera };
    }, [onSoffio, onSoffocata, onOre, onFinita, acceso, atmosfera]);

    // una candela nuova ricomincia da capo
    useEffect(() => {
        stato.current.ore = 0;
        stato.current.finita = false;
        stato.current.oreDette = -1;
    }, [rinnovo]);

    const uniFiamma = useMemo(
        () => ({ uTempo: { value: 0 }, uVento: { value: 0 }, uLuce: { value: 0 }, uPunta: { value: TINTE.butter.punta.clone() } }),
        []
    );
    const uniAlone = useMemo(() => ({ uLuce: { value: 0 }, uColore: { value: new THREE.Color("#ffb061") } }), []);

    const geoVetro = useMemo(() => {
        // profilo da ruotare: fuori dal basso verso l'alto, poi dentro dall'alto verso il basso
        const p = (r: number, y: number) => new THREE.Vector2(r, y);
        const profilo = [
            p(0, 0),
            p(0.64, 0),
            p(0.72, 0.02),
            p(0.75, 0.09),
            p(0.75, 1.8),
            p(0.738, 1.84),
            p(0.716, 1.87),
            // due giri di filettatura sul collo
            p(0.716, 1.9),
            p(0.732, 1.925),
            p(0.716, 1.95),
            p(0.716, 1.98),
            p(0.732, 2.005),
            p(0.716, 2.03),
            p(0.716, 2.08),
            // il labbro spesso e arrotondato
            p(0.722, 2.11),
            p(0.712, 2.14),
            p(0.69, H_VETRO),
            p(0.665, 2.145),
            p(0.652, 2.12),
            p(0.648, 1.88),
            p(0.668, 1.84),
            p(R_INTERNO, 1.8),
            p(R_INTERNO, FONDO + 0.05),
            p(0.66, FONDO + 0.01),
            p(0.6, FONDO),
            p(0, FONDO),
        ];
        return new THREE.LatheGeometry(profilo, 128);
    }, []);

    const fumo = useMemo(() => {
        const pos = new Float32Array(N_FUMO * 3);
        const vita = new Float32Array(N_FUMO).fill(1);
        const dim = new Float32Array(N_FUMO);
        const vel = new Float32Array(N_FUMO * 3);
        const seme = new Float32Array(N_FUMO).map((_, i) => (i * 2.39996) % 6.28318);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aVita", new THREE.BufferAttribute(vita, 1));
        geo.setAttribute("aSize", new THREE.BufferAttribute(dim, 1));
        return { geo, pos, vita, dim, vel, seme, prossima: 0 };
    }, []);

    // velocità del puntatore sopra la tela, in pixel al millisecondo
    useEffect(() => {
        const tela = document.documentElement;
        const muovi = (e: PointerEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            const ora = performance.now();
            const p = puntatore.current;
            if (p.noto) {
                const dt = Math.max(ora - p.t, 1);
                p.vel = p.vel * 0.5 + (Math.hypot(x - p.x, y - p.y) / dt) * 0.5;
            }
            p.x = x;
            p.y = y;
            p.t = ora;
            p.noto = true;
        };
        const esci = () => {
            puntatore.current.noto = false;
            puntatore.current.vel = 0;
        };
        tela.addEventListener("pointermove", muovi);
        tela.addEventListener("pointerdown", muovi);
        tela.addEventListener("pointerleave", esci);
        return () => {
            tela.removeEventListener("pointermove", muovi);
            tela.removeEventListener("pointerdown", muovi);
            tela.removeEventListener("pointerleave", esci);
        };
    }, []);

    const vec = useMemo(() => new THREE.Vector3(), []);
    const tinta = useMemo(() => new THREE.Color(), []);

    useFrame((state, delta) => {
        const s = stato.current;
        const cb = callback.current;
        const dt = Math.min(delta, 0.05);
        const t = state.clock.elapsedTime;

        // il tappo arriva a un dito dalla fiamma: si spegne davvero
        const tappo = faseTappo(chiusura.current);
        if (cb.acceso && tappo > 0.42) cb.onSoffocata();

        // accensione e spegnimento
        // niente fumo se l'ha spenta il tappo: uscirebbe attraverso il metallo
        if (s.eraAcceso && !cb.acceso && tappo < 0.2) s.fumoFino = t + 3;
        s.eraAcceso = cb.acceso;
        const obiettivo = cb.acceso ? 1 : 0;
        s.luce += (obiettivo - s.luce) * (cb.acceso ? 1.8 : 5) * dt;

        // la combustione: 40 ore in due minuti
        if (cb.acceso && !s.finita) {
            s.ore = Math.min(ORE_TOTALI, s.ore + dt / SECONDI_PER_ORA);
            const intere = Math.floor(s.ore);
            if (intere !== s.oreDette) {
                s.oreDette = intere;
                cb.onOre(intere);
            }
            if (s.ore >= ORE_TOTALI) {
                s.finita = true;
                cb.onFinita();
            }
        }
        const livello = 1 - s.ore / ORE_TOTALI;
        const hCera = CERA_MIN + (CERA_MAX - CERA_MIN) * livello;
        const cimaCera = FONDO + hCera;

        if (cera.current) {
            cera.current.scale.y = hCera;
            cera.current.position.y = FONDO + hCera / 2;
        }
        if (pozza.current) {
            pozza.current.position.y = cimaCera + 0.002;
            (pozza.current.material as THREE.MeshStandardMaterial).opacity = 0.85 * Math.min(s.luce * 1.5, 1);
        }
        if (stoppino.current) stoppino.current.position.y = cimaCera;
        // in una candela vera il vetro resta ambra scuro: la luce sta dentro, sulla cera vicino alla fiamma
        if (ceraMat.current) ceraMat.current.emissiveIntensity = 0.05 * s.luce;
        if (vetroMat.current) vetroMat.current.emissiveIntensity = 0.03 * s.luce;

        // il vento: la fiamma si piega lontano dal puntatore; un passaggio veloce la spegne
        const posFiamma = vec.set(0, cimaCera + 0.14, 0);
        fiamma.current?.parent?.localToWorld(posFiamma);
        posFiamma.project(camera);
        const fx = (posFiamma.x * 0.5 + 0.5) * size.width + schermo.current.ox;
        const fy = (-posFiamma.y * 0.5 + 0.5) * size.height + schermo.current.oy;
        let spinta = 0;
        const p = puntatore.current;
        const hPx = schermo.current.h || size.height * 0.4;
        if (p.noto) {
            const dx = fx - p.x;
            const d = Math.hypot(dx, fy - hPx * 0.06 - p.y);
            const raggio = hPx * 0.9;
            if (d < raggio) spinta = Math.sign(dx || 1) * (1 - d / raggio) * 1.4;
            if (cb.acceso && s.luce > 0.6 && d < hPx * 0.16 && p.vel > 1.3) {
                p.vel = 0;
                cb.onSoffio();
            }
            p.vel *= 0.9;
        }
        const tremolio = Math.sin(t * 3.7) * 0.1 + Math.sin(t * 11.3) * 0.05;
        s.vento += (spinta + tremolio - s.vento) * Math.min(dt * 5, 1);

        const tremola = 0.88 + Math.sin(t * 13.1) * 0.05 + Math.sin(t * 7.3) * 0.05 + Math.sin(t * 23.7) * 0.02;
        // sotto il tappo che scende la fiamma si abbassa
        const coperta = 1 - limita((tappo - 0.25) / 0.17) * 0.6;
        const luceVista = s.luce * coperta;
        tinta.set(TINTE[cb.atmosfera].luce);
        const uf = matFiamma.current?.uniforms;
        if (uf) {
            uf.uTempo.value = t;
            uf.uVento.value = s.vento;
            uf.uLuce.value = luceVista;
            (uf.uPunta.value as THREE.Color).lerp(TINTE[cb.atmosfera].punta, Math.min(dt * 3, 1));
        }
        const ua = matAlone.current?.uniforms;
        if (ua) {
            ua.uLuce.value = luceVista * 0.3 * tremola;
            (ua.uColore.value as THREE.Color).lerp(tinta, Math.min(dt * 3, 1));
        }

        if (fiamma.current) {
            fiamma.current.position.y = cimaCera + 0.09;
            const sc = 0.35 + 0.65 * s.luce;
            fiamma.current.scale.set(sc, sc * (0.95 + tremola * 0.08), sc);
        }
        if (luce.current) {
            luce.current.position.set(s.vento * 0.04, cimaCera + 0.3, 0);
            luce.current.intensity = 3.2 * luceVista * tremola;
            luce.current.color.lerp(tinta, Math.min(dt * 3, 1));
        }

        // il fumo
        const f = fumo;
        if (t < s.fumoFino) {
            for (let n = 0; n < 2; n++) {
                const i = f.prossima;
                f.prossima = (f.prossima + 1) % N_FUMO;
                f.pos[i * 3] = (Math.random() - 0.5) * 0.02;
                f.pos[i * 3 + 1] = cimaCera + 0.2;
                f.pos[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
                f.vel[i * 3] = (Math.random() - 0.5) * 0.02;
                f.vel[i * 3 + 1] = 0.32 + Math.random() * 0.18;
                f.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
                f.vita[i] = 0;
                f.dim[i] = 0.12;
            }
        }
        for (let i = 0; i < N_FUMO; i++) {
            if (f.vita[i] >= 1) continue;
            f.vita[i] = Math.min(1, f.vita[i] + dt / 4.5);
            const y = f.pos[i * 3 + 1];
            f.vel[i * 3] += Math.sin(y * 5.5 + t * 1.3 + f.seme[i]) * 0.09 * dt * (0.4 + f.vita[i]) + s.vento * 0.01 * dt;
            f.vel[i * 3 + 2] += Math.cos(y * 4.2 + t * 1.1 + f.seme[i]) * 0.06 * dt * (0.4 + f.vita[i]);
            f.pos[i * 3] += f.vel[i * 3] * dt;
            f.pos[i * 3 + 1] += f.vel[i * 3 + 1] * dt;
            f.pos[i * 3 + 2] += f.vel[i * 3 + 2] * dt;
            f.dim[i] += dt * 0.4;
        }
        f.geo.attributes.position.needsUpdate = true;
        f.geo.attributes.aVita.needsUpdate = true;
        f.geo.attributes.aSize.needsUpdate = true;
    });

    return (
        <>
            {/* luce di stanza al buio: fredda e bassa, quanto basta per vedere il vetro */}
            <hemisphereLight args={["#8a93a6", "#1f1916", 0.35]} />
            <directionalLight position={[-3, 4, 3]} intensity={0.35} color="#c8d0e0" />
            <pointLight ref={luce} distance={6} decay={2} intensity={0} color="#ffd2a0" />

            <Environment resolution={256} frames={1}>
                <Lightformer form="rect" intensity={1.2} position={[-4, 2, 3]} scale={[3, 5, 1]} color="#fff4e6" />
                <Lightformer form="rect" intensity={0.6} position={[4, 1, -2]} scale={[2, 4, 1]} color="#ffd9b0" />
                <Lightformer form="ring" intensity={0.8} position={[0, 5, 0]} scale={2} rotation-x={Math.PI / 2} />
            </Environment>

            <group position={[0, -1.25, 0]} visible={pronta}>
                {scatola !== "via" ? (
                    <Scatola stato={scatola} onApri={onApri} onAperta={onAperta} onSuono={onSuono} schermo={schermo} />
                ) : (
                    <Scatola stato="via" onApri={onApri} onAperta={onAperta} onSuono={onSuono} schermo={schermo} chiusura={chiusura} />
                )}

                {/* il vetro ambrato */}
                <mesh geometry={geoVetro} renderOrder={2}>
                    {leggero ? (
                        // sul telefono il vetro non rifrange: niente passaggi extra, niente scatti
                        <meshPhysicalMaterial
                            ref={vetroMat as never}
                            color="#8e4a16"
                            transparent
                            opacity={0.8}
                            roughness={0.05}
                            clearcoat={1}
                            clearcoatRoughness={0.04}
                            envMapIntensity={1.6}
                            emissive="#ffb070"
                            emissiveIntensity={0}
                            depthWrite={false}
                        />
                    ) : (
                        // vetro vero: rifrange la cera, lo stoppino e la fiamma che ha dentro
                        <MeshTransmissionMaterial
                            ref={vetroMat as never}
                            background={SFONDO_VETRO}
                            samples={6}
                            resolution={512}
                            transmission={1}
                            thickness={0.22}
                            roughness={0.03}
                            ior={1.5}
                            chromaticAberration={0.025}
                            anisotropy={0.08}
                            distortion={0}
                            color="#c98a45"
                            attenuationColor="#6a3210"
                            attenuationDistance={0.62}
                            clearcoat={1}
                            clearcoatRoughness={0.03}
                            envMapIntensity={1.6}
                            emissive="#ffb070"
                            emissiveIntensity={0}
                        />
                    )}
                </mesh>

                {/* la cera di soia */}
                <mesh ref={cera} position={[0, FONDO + CERA_MAX / 2, 0]} scale={[1, CERA_MAX, 1]}>
                    <cylinderGeometry args={[R_INTERNO - 0.004, R_INTERNO - 0.03, 1, 96]} />
                    <meshStandardMaterial
                        ref={ceraMat}
                        color="#f3ece0"
                        roughness={0.85}
                        emissive="#ff9a4a"
                        emissiveIntensity={0}
                    />
                </mesh>
                {/* la pozza di cera fusa, lucida, solo a candela accesa */}
                <mesh ref={pozza} rotation-x={-Math.PI / 2} position={[0, FONDO + CERA_MAX, 0]}>
                    <circleGeometry args={[R_INTERNO - 0.01, 96]} />
                    <meshStandardMaterial color="#e2d0b2" roughness={0.12} metalness={0} transparent opacity={0} />
                </mesh>

                {/* lo stoppino in legno, piatto, con la punta bruciata */}
                <group ref={stoppino} position={[0, FONDO + CERA_MAX, 0]}>
                    <mesh position={[0, 0.06, 0]}>
                        <boxGeometry args={[0.2, 0.12, 0.022]} />
                        <meshStandardMaterial color="#d2a383" roughness={0.85} />
                    </mesh>
                    <mesh position={[0, 0.13, 0]}>
                        <boxGeometry args={[0.19, 0.022, 0.024]} />
                        <meshStandardMaterial color="#1c1714" roughness={1} />
                    </mesh>
                </group>

                {/* l'etichetta col logo, avvolta sul vetro */}
                {etichetta && (
                    <mesh ref={fuoriDalVetro} position={[0, H_VETRO * 0.15 + hEtichetta / 2, 0]} renderOrder={3}>
                        <cylinderGeometry
                            args={[R_ETICHETTA, R_ETICHETTA, hEtichetta, 96, 1, true, -ARCO_ETICHETTA / 2, ARCO_ETICHETTA]}
                        />
                        <meshStandardMaterial
                            map={etichetta}
                            emissiveMap={etichetta}
                            emissive="#ffffff"
                            // un filo di luce propria: la carta si legge al buio, ma resta carta e prende le ombre del vetro
                            emissiveIntensity={0.28}
                            roughness={0.5}
                            alphaTest={0.5}
                            side={THREE.FrontSide}
                        />
                    </mesh>
                )}

                <Tappo
                    atmosfera={atmosfera}
                    chiusura={chiusura}
                    stato={tappo}
                    inScatola={scatola !== "via"}
                    schermo={schermo}
                    onStappa={onStappa}
                    onTolto={onTolto}
                    onSuono={onSuono}
                />

                {/* la fiamma e il suo alone */}
                <group ref={fiamma} position={[0, FONDO + CERA_MAX + 0.09, 0]}>
                    <Billboard lockX lockZ>
                        <mesh position={[0, 0.27, 0]} renderOrder={5}>
                            <planeGeometry args={[0.34, 0.62]} />
                            <shaderMaterial
                                ref={matFiamma}
                                vertexShader={fiammaVertex}
                                fragmentShader={fiammaFragment}
                                uniforms={uniFiamma}
                                transparent
                                depthWrite={false}
                                depthTest={false}
                                side={THREE.DoubleSide}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    </Billboard>
                    <Billboard>
                        <mesh position={[0, 0.16, 0]} renderOrder={4}>
                            <planeGeometry args={[2.4, 2.4]} />
                            <shaderMaterial
                                ref={matAlone}
                                vertexShader={fiammaVertex}
                                fragmentShader={alonFragment}
                                uniforms={uniAlone}
                                transparent
                                depthWrite={false}
                                depthTest={false}
                                side={THREE.DoubleSide}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    </Billboard>
                </group>

                <points geometry={fumo.geo} renderOrder={6}>
                    <shaderMaterial vertexShader={fumoVertex} fragmentShader={fumoFragment} transparent depthWrite={false} />
                </points>

            </group>
        </>
    );
}

/* ---------- il viaggio: la candela segue le ancore della pagina ---------- */

interface Ancora {
    el: HTMLElement;
    tipo: string;
    cx: number;
    cy: number;
    h: number;
    p: number;
}

const morbido = (x: number) => {
    const k = limita(x);
    return k * k * (3 - 2 * k);
};

function leggiAncore(vh: number): Ancora[] {
    // le ancore nascoste (una per il telefono, una per lo schermo grande) non contano
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-ancora]")).filter((el) => el.offsetHeight > 0);
    return els.map((el) => {
        const r = el.getBoundingClientRect();
        let p = 0;
        const sezione = el.closest("section");
        if (sezione) {
            const rs = sezione.getBoundingClientRect();
            const corsa = rs.height - vh;
            p = corsa > 0 ? limita(-rs.top / corsa) : 0;
        }
        return {
            el,
            tipo: el.dataset.ancora ?? "",
            cx: r.left + r.width / 2,
            cy: r.top + r.height * Number(el.dataset.centroY ?? 0.5),
            h: r.height * Number(el.dataset.altezza ?? 0.6),
            p,
        };
    });
}

// altezza della candela nella scena (la scatola chiusa, la parte più alta)
const ALTEZZA_SCENA = 2.55;
const DISTANZA = 10;
const FOV = 30;

/*
 * Sul telefono la candela non insegue la pagina: la tela sta dentro la sua ancora e scorre con lei,
 * mossa da Safari stesso. Una tela fissa che rilegge la posizione a ogni fotogramma arriva sempre
 * un fotogramma dopo lo scroll, e sul telefono si vede come una candela che sobbalza.
 */
const attaccata = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

/** Sul telefono: in quale ancora sta la tela, e dove sta la candela dentro la tela (in pixel). */
interface Aggancio {
    el: HTMLElement | null;
    tipo: string;
    cx: number;
    cy: number;
    h: number;
}

/*
 * Sceglie l'ancora e ci mette dentro la tela. Si passa alla prossima PRIMA che entri nello schermo
 * (scendendo, quando la sua candela sta per affacciarsi dal basso; salendo, dall'alto): così la
 * candela è già lì quando arriva, invece di comparire di colpo dentro uno spazio vuoto.
 * In quella che si lascia resta una foto ferma della candela, che esce con la pagina.
 */
function aggancia(host: HTMLDivElement, ag: Aggancio, verso: number, foto: (() => HTMLCanvasElement | null) | null) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ancore = leggiAncore(vh);
    if (!ancore.length) return;
    const dentro = (a: Ancora) => a.cy + a.h * 0.55 > 0 && a.cy - a.h * 0.6 < vh;
    let i = ancore.findIndex((a) => a.el === ag.el);
    if (i < 0 || !dentro(ancore[i])) {
        // primo aggancio o salto con un link: la più vicina al centro dello schermo
        i = 0;
        for (let k = 1; k < ancore.length; k++) {
            if (Math.abs(ancore[k].cy - vh / 2) < Math.abs(ancore[i].cy - vh / 2)) i = k;
        }
    } else if (verso > 0 && ancore[i + 1] && ancore[i + 1].cy - ancore[i + 1].h * 0.6 < vh) {
        i++;
    } else if (verso < 0 && ancore[i - 1] && ancore[i - 1].cy + ancore[i - 1].h * 0.55 > 0) {
        i--;
    }
    const scelta = ancore[i];
    const el = scelta.el;
    const r = el.getBoundingClientRect();
    const cx = r.width / 2;
    const cy = r.height * Number(el.dataset.centroY ?? 0.5);
    // la tela ha la stessa misura in ogni ancora: ridimensionarla la svuota per un fotogramma, e si vede.
    // Sopra c'è spazio per il coperchio che vola via e per il fumo; mai più larga dello schermo
    const hMax = Math.max(...ancore.map((a) => a.h));
    const larga = Math.round(Math.min(hMax * 1.6, vw));
    const alta = Math.round(hMax * 2.5);
    const sopra = Math.round(hMax * 1.7);
    const sinistra = Math.round(Math.min(Math.max(cx - larga / 2, -r.left), vw - r.left - larga));
    const alto = Math.round(cy - sopra);

    if (host.parentElement !== el) {
        const vecchia = host.parentElement;
        const prima = ancore.find((a) => a.el === vecchia);
        const tela = foto?.();
        if (vecchia && prima && dentro(prima) && tela) {
            const c = document.createElement("canvas");
            c.width = tela.width;
            c.height = tela.height;
            c.getContext("2d")?.drawImage(tela, 0, 0);
            c.dataset.fotoCandela = "";
            c.setAttribute("aria-hidden", "true");
            c.style.cssText = host.style.cssText;
            vecchia.appendChild(c);
        }
        el.querySelector(":scope > [data-foto-candela]")?.remove();
        el.appendChild(host);
    }
    const stile = { left: `${sinistra}px`, top: `${alto}px`, width: `${larga}px`, height: `${alta}px` };
    for (const [k, v] of Object.entries(stile)) {
        if (host.style.getPropertyValue(k) !== v) host.style.setProperty(k, v);
    }
    ag.el = el;
    ag.tipo = scelta.tipo;
    ag.cx = cx - sinistra;
    ag.cy = sopra;
    ag.h = scelta.h;
}

/* Dà a chi aggancia un modo di fotografare la candela così com'è adesso */
function Fotografo({ rif }: { rif: React.RefObject<(() => HTMLCanvasElement) | null> }) {
    const { gl, scene, camera } = useThree();
    useEffect(() => {
        rif.current = () => {
            // si ridisegna subito prima di copiare: il buffer della tela vale solo nel fotogramma in cui è disegnato
            gl.render(scene, camera);
            return gl.domElement;
        };
        return () => {
            rif.current = null;
        };
    }, [gl, scene, camera, rif]);
    return null;
}

interface ViaggioProps {
    schermo: React.RefObject<Schermo>;
    aggancio: React.RefObject<Aggancio> | null;
    chiusura: React.RefObject<number>;
    girabile: boolean;
    libera: boolean;
    children: React.ReactNode;
}

function Viaggio({ schermo, aggancio, chiusura, girabile, libera, children }: ViaggioProps) {
    const g = useRef<THREE.Group>(null);
    const giro = useRef({ attuale: 0, trascina: 0, x0: 0, attivo: false });
    const cb = useRef({ girabile, libera });
    useEffect(() => {
        cb.current = { girabile, libera };
    }, [girabile, libera]);

    // col mouse la candela si gira trascinandola; lasciata, torna al suo posto
    useEffect(() => {
        const giu = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" || !cb.current.girabile || !cb.current.libera) return;
            if (!sopraLaCandela(e.clientX, e.clientY, schermo.current, 0.32)) return;
            giro.current.attivo = true;
            giro.current.x0 = e.clientX - giro.current.trascina * 180;
            e.preventDefault();
        };
        const muovi = (e: PointerEvent) => {
            if (giro.current.attivo) giro.current.trascina = (e.clientX - giro.current.x0) / 180;
        };
        const su = () => {
            giro.current.attivo = false;
        };
        window.addEventListener("pointerdown", giu);
        window.addEventListener("pointermove", muovi);
        window.addEventListener("pointerup", su);
        return () => {
            window.removeEventListener("pointerdown", giu);
            window.removeEventListener("pointermove", muovi);
            window.removeEventListener("pointerup", su);
        };
    }, [schermo]);

    useFrame((state, delta) => {
        const gr = g.current;
        if (!gr) return;
        const vw = state.size.width;
        const vh = state.size.height;
        const dt = Math.min(delta, 0.05);
        let cx: number;
        let cy: number;
        let h: number;
        let giroScroll: number;
        const ag = aggancio?.current;
        if (ag) {
            // telefono: la tela scorre già con l'ancora, qui si legge solo quanto è avanti la sezione
            if (!ag.el) return;
            let p = 0;
            const sezione = ag.el.closest("section");
            if (sezione) {
                const rs = sezione.getBoundingClientRect();
                const corsa = rs.height - window.innerHeight;
                p = corsa > 0 ? limita(-rs.top / corsa) : 0;
            }
            cx = ag.cx;
            cy = ag.cy;
            h = ag.h;
            giroScroll = ag.tipo === "fragranze" ? p * Math.PI * 2 : 0;
            chiusura.current = ag.tipo === "cofanetti" ? limita(p / 0.75) : 0;
            const tela = state.gl.domElement.getBoundingClientRect();
            schermo.current.ox = tela.left;
            schermo.current.oy = tela.top;
        } else {
        const ancore = leggiAncore(vh);
        if (!ancore.length) return;

        // la coppia di ancore tra cui sta il centro dello schermo
        const vc = vh / 2;
        let a = ancore[0];
        let b: Ancora | null = null;
        for (let i = 0; i < ancore.length; i++) {
            if (ancore[i].cy <= vc) {
                a = ancore[i];
                b = ancore[i + 1] ?? null;
            }
        }
        let f = b ? morbido((vc - a.cy) / Math.max(b.cy - a.cy, 1)) : 0;
        // sul telefono le ancore stanno una sopra l'altra: volando, la candela passerebbe sopra il testo.
        // Resta attaccata alla sua ancora finché questa esce dallo schermo, poi passa alla prossima
        // (lo scambio avviene quando sono fuori tutte e due, quindi non si vede)
        if (b && vw < 768) f = a.cy > -a.h * 0.6 ? 0 : 1;
        const mix = (x: number, y: number) => x + (y - x) * f;
        cx = b ? mix(a.cx, b.cx) : a.cx;
        cy = b ? mix(a.cy, b.cy) : a.cy;
        h = b ? mix(a.h, b.h) : a.h;
        const valore = (x: Ancora | null, tipo: string, fn: (p: number) => number) => (x && x.tipo === tipo ? fn(x.p) : 0);
        giroScroll = mix(valore(a, "fragranze", (p) => p * Math.PI * 2), valore(b, "fragranze", (p) => p * Math.PI * 2));
        chiusura.current = mix(valore(a, "cofanetti", (p) => limita(p / 0.75)), valore(b, "cofanetti", (p) => limita(p / 0.75)));
        if (!b) {
            chiusura.current = valore(a, "cofanetti", (p) => limita(p / 0.75));
        }
        }

        schermo.current.cx = cx + schermo.current.ox;
        schermo.current.cy = cy + schermo.current.oy;
        schermo.current.h = h;

        const wpp = (2 * DISTANZA * Math.tan((FOV * Math.PI) / 360)) / vh;
        const scala = (h * wpp) / ALTEZZA_SCENA;
        // posizione esatta, senza ammorbidire: con lo scroll veloce del telefono un inseguimento
        // si vede come una candela che "nuota" dietro la pagina
        gr.position.x = (cx - vw / 2) * wpp;
        gr.position.y = -(cy - vh / 2) * wpp;
        gr.scale.setScalar(scala);

        if (!giro.current.attivo) giro.current.trascina *= 1 - Math.min(dt * 4, 1);
        giro.current.attuale = giroScroll + giro.current.trascina * Math.PI;
        gr.rotation.y = giro.current.attuale;
    });

    return (
        <group ref={g} rotation-x={0.16}>
            {children}
        </group>
    );
}

interface Candela3DProps extends Omit<ScenaProps, "schermo" | "chiusura"> {
    girabile: boolean;
}

export default function Candela3D({ girabile, ...scena }: Candela3DProps) {
    const schermo = useRef<Schermo>({ cx: -9999, cy: -9999, h: 0, ox: 0, oy: 0 });
    const aggancio = useRef<Aggancio>({ el: null, tipo: "", cx: 0, cy: 0, h: 0 });
    const fotografa = useRef<(() => HTMLCanvasElement) | null>(null);
    // la tela entra in dissolvenza solo quando vasetto, etichetta e pack sono tutti pronti
    const [pronta, setPronta] = useState(false);
    const segnaPronta = useCallback(() => setPronta(true), []);
    const entrata = { opacity: pronta ? 1 : 0, transition: "opacity 700ms ease-out" };
    // sul telefono la tela vive in un contenitore che passa da un'ancora all'altra (la tela non si rifà)
    const [host] = useState(() => {
        if (!attaccata) return null;
        const d = document.createElement("div");
        d.setAttribute("aria-hidden", "true");
        d.style.cssText = "position:absolute;z-index:30;pointer-events:none";
        return d;
    });
    useLayoutEffect(() => {
        if (!host) return;
        // la tela aspetta di avere una misura: si accende appena il contenitore entra nell'ancora
        aggancia(host, aggancio.current, 0, null);
        let richiesta = 0;
        let ultimaY = window.scrollY;
        const aggiorna = () => {
            if (richiesta) return;
            richiesta = requestAnimationFrame(() => {
                richiesta = 0;
                const y = window.scrollY;
                aggancia(host, aggancio.current, Math.sign(y - ultimaY), fotografa.current);
                ultimaY = y;
            });
        };
        window.addEventListener("scroll", aggiorna, { passive: true });
        window.addEventListener("resize", aggiorna);
        return () => {
            window.removeEventListener("scroll", aggiorna);
            window.removeEventListener("resize", aggiorna);
            cancelAnimationFrame(richiesta);
            host.remove();
            document.querySelectorAll("[data-foto-candela]").forEach((c) => c.remove());
        };
    }, [host]);
    const chiusura = useRef(0);
    // quando nessuna ancora è in vista (laboratorio, ordine, footer) il 3D non disegna niente
    const [inVista, setInVista] = useState(true);
    useEffect(() => {
        const visibili = new Set<Element>();
        const io = new IntersectionObserver(
            (voci) => {
                for (const v of voci) {
                    if (v.isIntersecting) visibili.add(v.target);
                    else visibili.delete(v.target);
                }
                setInVista(visibili.size > 0);
            },
            { rootMargin: "30% 0px" }
        );
        document.querySelectorAll("[data-ancora]").forEach((el) => io.observe(el.closest("section") ?? el));
        return () => io.disconnect();
    }, []);
    const tela = (
        <Canvas
            // sul telefono la tela è grande quanto la candela, non quanto lo schermo: può permettersi pixel pieni
            dpr={host ? [1, 2] : leggero ? [1, 1.5] : [1, 1.75]}
            frameloop={inVista ? "always" : "never"}
            camera={{ position: [0, 0, DISTANZA], fov: FOV }}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
            // nessun evento sulla tela: non serve rimisurarla a ogni scroll
            resize={{ scroll: false }}
            style={{ pointerEvents: "none" }}
        >
            {host && <Fotografo rif={fotografa} />}
            <Viaggio schermo={schermo} aggancio={host ? aggancio : null} chiusura={chiusura} girabile={girabile} libera={scena.scatola === "via"}>
                <Oscilla>
                    <Scena {...scena} schermo={schermo} chiusura={chiusura} onPronta={segnaPronta} />
                </Oscilla>
            </Viaggio>
        </Canvas>
    );
    if (host) return createPortal(<div data-candela className="h-full w-full" style={entrata}>{tela}</div>, host);
    return (
        // alta quanto lo schermo con la barra di Safari nascosta (lvh): quando la barra va e viene
        // la tela non si ridimensiona e la candela non salta
        <div data-candela className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[100lvh]" style={entrata} aria-hidden="true">
            {tela}
        </div>
    );
}

/* La candela galleggia e oscilla piano, così il vetro mostra i riflessi anche senza toccarlo */
function Oscilla({ children }: { children: React.ReactNode }) {
    const g = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (!g.current) return;
        const t = clock.elapsedTime;
        g.current.rotation.y = Math.sin(t * 0.25) * 0.35;
        // galleggia: su e giù piano, con un'inclinazione appena percettibile
        g.current.position.y = Math.sin(t * 0.9) * 0.07;
        g.current.rotation.z = Math.sin(t * 0.7 + 1) * 0.025;
    });
    return <group ref={g}>{children}</group>;
}
