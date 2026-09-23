/*
 * Il suono dello stoppino in legno: piccoli schiocchi casuali, a volte in grappoli,
 * sopra un fruscio bassissimo di fiamma. Tutto generato con Web Audio, nessun file.
 * L'AudioContext nasce solo dentro un gesto dell'utente (il clic che accende).
 */

type Ctx = AudioContext;

export class Crepitio {
    private ctx: Ctx | null = null;
    private uscita: GainNode | null = null;
    private fruscio: AudioBufferSourceNode | null = null;
    private fruscioGain: GainNode | null = null;
    private timer: ReturnType<typeof setTimeout> | null = null;
    private attivo = false;

    /** Da chiamare dentro un gesto dell'utente: crea o risveglia l'audio. */
    prepara() {
        if (typeof window === "undefined") return;
        if (!this.ctx) {
            const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.uscita = this.ctx.createGain();
            this.uscita.gain.value = 0.9;
            this.uscita.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") void this.ctx.resume();
    }

    private rumore(durata: number, decadimento: number) {
        const ctx = this.ctx!;
        const n = Math.max(1, Math.floor(ctx.sampleRate * durata));
        const buf = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp((-i / n) * decadimento);
        return buf;
    }

    private schiocco(forza: number, ritardo = 0) {
        const ctx = this.ctx!;
        const src = ctx.createBufferSource();
        src.buffer = this.rumore(0.004 + Math.random() * 0.02, 6 + Math.random() * 6);
        const filtro = ctx.createBiquadFilter();
        filtro.type = "bandpass";
        filtro.frequency.value = 1400 + Math.random() * 3600;
        filtro.Q.value = 0.7 + Math.random() * 1.5;
        const g = ctx.createGain();
        g.gain.value = forza;
        src.connect(filtro).connect(g).connect(this.uscita!);
        src.start(ctx.currentTime + ritardo);
    }

    private prossimo = () => {
        if (!this.attivo || !this.ctx) return;
        const r = Math.random();
        if (r < 0.14) {
            // un grappolo: il legno che scoppietta più forte
            const quanti = 2 + Math.floor(Math.random() * 4);
            for (let i = 0; i < quanti; i++) this.schiocco(0.18 + Math.random() * 0.3, i * (0.012 + Math.random() * 0.05));
        } else {
            this.schiocco(0.04 + Math.random() * 0.16);
        }
        // piano: in media 4-5 schiocchi al secondo, irregolari
        this.timer = setTimeout(this.prossimo, 40 + Math.random() * 380);
    };

    avvia() {
        if (!this.ctx || this.attivo) return;
        this.attivo = true;
        const ctx = this.ctx;
        // il fruscio della fiamma: rumore filtrato basso, quasi al limite dell'udibile
        const src = ctx.createBufferSource();
        src.buffer = this.rumore(2, 0);
        src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 380;
        this.fruscioGain = ctx.createGain();
        this.fruscioGain.gain.setValueAtTime(0, ctx.currentTime);
        this.fruscioGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
        src.connect(lp).connect(this.fruscioGain).connect(this.uscita!);
        src.start();
        this.fruscio = src;
        this.timer = setTimeout(this.prossimo, 600);
    }

    ferma() {
        this.attivo = false;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        if (this.ctx && this.fruscio && this.fruscioGain) {
            const ora = this.ctx.currentTime;
            this.fruscioGain.gain.cancelScheduledValues(ora);
            this.fruscioGain.gain.setValueAtTime(this.fruscioGain.gain.value, ora);
            this.fruscioGain.gain.linearRampToValueAtTime(0, ora + 0.4);
            this.fruscio.stop(ora + 0.45);
        }
        this.fruscio = null;
    }

    /** Il soffio che spegne: un'aria breve che sale e cala. */
    soffio() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const src = ctx.createBufferSource();
        src.buffer = this.rumore(0.55, 0);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 0.6;
        bp.frequency.setValueAtTime(700, ctx.currentTime);
        bp.frequency.linearRampToValueAtTime(1600, ctx.currentTime + 0.18);
        bp.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.5);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.52);
        src.connect(bp).connect(g).connect(this.uscita!);
        src.start();
    }

    /** Il tubo di cartone che si stappa: un "pop" d'aria risucchiata, sordo, con un soffio che esce. */
    /* uno scatto del tappo di metallo sulla filettatura (uno per ogni quarto di giro) */
    scatto() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const scatto = ctx.createBufferSource();
        scatto.buffer = this.rumore(0.03, 9);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 3000 + Math.random() * 900;
        bp.Q.value = 4;
        const g = ctx.createGain();
        g.gain.value = 0.16 + Math.random() * 0.06;
        scatto.connect(bp).connect(g).connect(this.uscita!);
        scatto.start(t);
    }

    /* il "tin" del tappo che si stacca dal vetro */
    tin() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const tin = ctx.createOscillator();
        tin.type = "sine";
        tin.frequency.setValueAtTime(2300, t);
        const gt = ctx.createGain();
        gt.gain.setValueAtTime(0, t);
        gt.gain.linearRampToValueAtTime(0.09, t + 0.004);
        gt.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        tin.connect(gt).connect(this.uscita!);
        tin.start(t);
        tin.stop(t + 0.4);
    }

    stappo() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const ora = ctx.currentTime;
        // il colpo: una nota bassa che cade di tono in fretta
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, ora);
        osc.frequency.exponentialRampToValueAtTime(85, ora + 0.09);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ora);
        g.gain.linearRampToValueAtTime(0.55, ora + 0.006);
        g.gain.exponentialRampToValueAtTime(0.001, ora + 0.16);
        osc.connect(g).connect(this.uscita!);
        osc.start(ora);
        osc.stop(ora + 0.18);
        // l'aria che entra nel tubo
        const aria = ctx.createBufferSource();
        aria.buffer = this.rumore(0.22, 3);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(900, ora);
        bp.frequency.exponentialRampToValueAtTime(350, ora + 0.2);
        bp.Q.value = 1.2;
        const ga = ctx.createGain();
        ga.gain.value = 0.22;
        aria.connect(bp).connect(ga).connect(this.uscita!);
        aria.start(ora + 0.004);
        // il cartone che struscia un attimo
        const carta = ctx.createBufferSource();
        carta.buffer = this.rumore(0.08, 5);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2500;
        const gc = ctx.createGain();
        gc.gain.value = 0.08;
        carta.connect(hp).connect(gc).connect(this.uscita!);
        carta.start(ora);
    }

    /** Il coperchio che si posa sopra e soffoca la fiamma: un tonfo ovattato e uno sfrigolio che muore. */
    soffoca() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const ora = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ora);
        osc.frequency.exponentialRampToValueAtTime(70, ora + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ora);
        g.gain.linearRampToValueAtTime(0.4, ora + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ora + 0.2);
        osc.connect(g).connect(this.uscita!);
        osc.start(ora);
        osc.stop(ora + 0.22);
        // la fiamma che si spegne: uno sfrigolio acuto, subito smorzato dal cartone
        const sfrigola = ctx.createBufferSource();
        sfrigola.buffer = this.rumore(0.45, 4);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2800;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(7000, ora + 0.05);
        lp.frequency.exponentialRampToValueAtTime(1800, ora + 0.4);
        const gs = ctx.createGain();
        gs.gain.setValueAtTime(0, ora + 0.03);
        gs.gain.linearRampToValueAtTime(0.1, ora + 0.07);
        gs.gain.exponentialRampToValueAtTime(0.001, ora + 0.45);
        sfrigola.connect(hp).connect(lp).connect(gs).connect(this.uscita!);
        sfrigola.start(ora + 0.03);
    }

    set muto(v: boolean) {
        if (!this.uscita || !this.ctx) return;
        this.uscita.gain.setTargetAtTime(v ? 0 : 0.9, this.ctx.currentTime, 0.05);
    }
}
