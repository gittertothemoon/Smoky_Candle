import { InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export default function Footer() {
    return (
        <footer id="contatti" className="bg-fuliggine text-carta">
            <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-12 md:py-20 lg:px-10">
                <div className="md:col-span-5">
                    <Image
                        src="/images/wordmark.webp"
                        alt="Smoky Candle"
                        width={200}
                        height={200}
                        className="-ml-3 h-28 w-auto [filter:brightness(0)_invert(1)]"
                    />
                    <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-carta/70">
                        Candele in cera di soia, colate a mano in Italia. Due fragranze pensate per durare.
                    </p>
                </div>

                <ul className="space-y-4 md:col-span-4 md:col-start-9 md:pt-8">
                    <li>
                        <a
                            href="mailto:info@smokycandle.it"
                            className="inline-flex min-h-11 items-center gap-3 text-base text-carta/85 transition-colors hover:text-carta"
                        >
                            <EnvelopeSimple size={20} weight="light" aria-hidden="true" />
                            info@smokycandle.it
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://instagram.com/smokycandle"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-3 text-base text-carta/85 transition-colors hover:text-carta"
                        >
                            <InstagramLogo size={20} weight="light" aria-hidden="true" />
                            @smokycandle su Instagram
                        </a>
                    </li>
                </ul>
            </div>
            <div className="border-t border-carta/10">
                <p className="mx-auto max-w-[1320px] px-4 py-6 text-sm text-carta/60 sm:px-6 lg:px-10">
                    &copy; {new Date().getFullYear()} Smoky Candle. Colate a mano in Italia.
                </p>
            </div>
        </footer>
    );
}
