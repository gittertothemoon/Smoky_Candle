import { EMAIL_ORDINI } from "@/lib/catalogo";

const passi = [
    {
        titolo: "Metti nel carrello",
        testo: "Scegli le candele o un cofanetto. Il carrello tiene il conto del totale.",
    },
    {
        titolo: "Invia l'ordine",
        testo: "Dal carrello si apre una mail già compilata con quello che hai scelto. Aggiungi il tuo indirizzo e mandala.",
    },
    {
        titolo: "Ti rispondiamo noi",
        testo: "Entro un giorno lavorativo ti scriviamo per il pagamento. La spedizione in Italia è gratuita e arriva in 2-4 giorni.",
    },
];

export default function ComeOrdinare() {
    return (
        <section id="come-ordinare" className="border-t border-fuliggine/10 bg-cenere-scura/50">
            <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-4 py-24 sm:px-6 md:grid-cols-12 md:gap-6 md:py-32 lg:px-10">
                <div className="md:col-span-4">
                    <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.015em]">
                        Come si ordina.
                    </h2>
                    <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-fumo">
                        Per ora gli ordini passano da una mail, e rispondiamo a ognuna di persona. Per qualsiasi domanda scrivi a{" "}
                        <a href={`mailto:${EMAIL_ORDINI}`} className="text-fuliggine underline decoration-fuliggine/30 underline-offset-4 hover:decoration-fuliggine">
                            {EMAIL_ORDINI}
                        </a>
                        .
                    </p>
                </div>

                <ol className="md:col-span-7 md:col-start-6">
                    {passi.map((p, i) => (
                        <li key={p.titolo} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-fuliggine/15 py-7 first:border-t-0 first:pt-0 md:grid-cols-[4rem_1fr]">
                            <span className="font-serif text-3xl text-accento transizione-accento" aria-hidden="true">
                                {i + 1}
                            </span>
                            <div>
                                <h3 className="font-serif text-2xl">{p.titolo}</h3>
                                <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-fumo">{p.testo}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
