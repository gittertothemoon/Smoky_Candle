import { InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

const negozio = [
    { label: "Fragranze", href: "#fragranze" },
    { label: "Cofanetti", href: "#cofanetti" },
    { label: "Laboratorio", href: "#laboratorio" },
];

interface FooterProps {
    /** la candela dell'apertura: se è ancora accesa, la chiusura lo dice */
    acceso: boolean;
    ore: number;
}

export default function Footer({ acceso, ore }: FooterProps) {
    const saluto = acceso
        ? "La tua candela è ancora accesa. Buona serata."
        : ore > 0
          ? "Grazie della visita. Alla prossima sera."
          : "Accendila quando hai voglia di rallentare.";
    return (
        <footer id="contatti" className="bg-fuliggine text-carta">
            <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-4 pt-16 pb-12 sm:px-6 md:grid-cols-12 md:gap-6 md:pt-24 md:pb-16 lg:px-10">
                <div className="md:col-span-7">
                    <Image
                        src="/images/wordmark.webp"
                        alt="Smoky Candle"
                        width={200}
                        height={200}
                        className="h-20 w-auto [filter:brightness(0)_invert(1)] md:h-24"
                    />
                    <p className="mt-8 max-w-[18ch] font-serif text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.01em]" aria-live="polite">
                        {saluto}
                    </p>
                    <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-carta/65">
                        Candele in cera di soia, colate a mano in Italia, poche alla volta.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 md:col-span-4 md:col-start-9 md:self-end">
                    <nav aria-label="Il negozio">
                        <h2 className="text-sm text-carta/50">Il negozio</h2>
                        <ul className="mt-3">
                            {negozio.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} className="inline-flex min-h-11 items-center text-base text-carta/85 transition-colors hover:text-carta">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div>
                        <h2 className="text-sm text-carta/50">Scrivici</h2>
                        <ul className="mt-3">
                            <li>
                                <a
                                    href="mailto:info@smokycandle.it"
                                    className="inline-flex min-h-11 items-center gap-2.5 text-base text-carta/85 transition-colors hover:text-carta"
                                >
                                    <EnvelopeSimple size={19} weight="light" aria-hidden="true" />
                                    Mail
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://instagram.com/smokycandle"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 items-center gap-2.5 text-base text-carta/85 transition-colors hover:text-carta"
                                >
                                    <InstagramLogo size={19} weight="light" aria-hidden="true" />
                                    Instagram
                                </a>
                            </li>
                        </ul>
                        <p className="mt-2 text-sm text-carta/50">info@smokycandle.it</p>
                    </div>
                </div>
            </div>
            <div className="border-t border-carta/10">
                <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-5 text-sm text-carta/55 sm:px-6 lg:px-10">
                    <p>&copy; {new Date().getFullYear()} Smoky Candle. Colate a mano in Italia.</p>
                    <a href="#" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap transition-colors hover:text-carta">
                        Torna su
                    </a>
                </div>
            </div>
        </footer>
    );
}
