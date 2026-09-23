import Image from "next/image";

const principi = [
    {
        titolo: "Cera di soia pura",
        testo: "Vegetale, biodegradabile, a combustione lenta. Luce calda senza fumo nero, e un finale pulito sul vetro.",
    },
    {
        titolo: "Fragranze pulite",
        testo: "Composti aromatici certificati IFRA, niente ftalati, niente parabeni. Lo stoppino è in legno: crepita piano mentre brucia.",
    },
    {
        titolo: "Un vetro che vive",
        testo: "Quando la candela finisce, il barattolo comincia una seconda vita. Fiori secchi, pennelli, piccoli rituali. Scegli tu quale.",
    },
];

export default function BrandStory() {
    return (
        <section id="laboratorio" className="mx-auto max-w-[1320px] px-4 py-24 sm:px-6 md:py-36 lg:px-10">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-5">
                    <div
                        className="relative aspect-[3/4] overflow-hidden bg-cenere-scura"
                        style={{ borderRadius: "999px 999px 0 0 / 38% 38% 0 0" }}
                    >
                        <Image
                            src="/images/home_5.webp"
                            alt="Candela Butter accesa accanto alla sua scatola bianca"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 40vw"
                        />
                    </div>
                </div>

                <div className="md:col-span-6 md:col-start-7 md:pt-16">
                    <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.015em]">
                        Una candela alla volta.
                    </h2>
                    <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-fumo">
                        Coliamo ogni candela a mano, in lotti piccoli. Cera di soia pura, niente paraffina, niente scorciatoie. Quello che mettiamo dentro è quello che senti quando la accendi.
                    </p>

                    <dl className="mt-12">
                        {principi.map((p) => (
                            <div key={p.titolo} className="grid grid-cols-1 gap-2 border-t border-fuliggine/15 py-6 sm:grid-cols-[13rem_1fr] sm:gap-6">
                                <dt className="font-serif text-xl">{p.titolo}</dt>
                                <dd className="max-w-[44ch] text-base leading-relaxed text-fumo">{p.testo}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}
