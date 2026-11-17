import Image from "next/image";
import Link from "next/link";
import { logo } from "../../assets";

// Logo + "MurreeFoods.com" (panels aur rider pages ke liye)
// showWordmark={false}: sirf tasveer (tang jagah ke liye, jaise mobile drawer)
export default function BrandLogo({ href = "/", showWordmark = true }: { href?: string; showWordmark?: boolean }) {
  return (
    <Link href={href} aria-label="MurreeFoods.com home" className="inline-flex items-center gap-2">
      <Image src={logo} alt="Murree Food" width={80} height={44} loading="eager" className="h-8 w-auto" />
      {showWordmark && (
        <span className="whitespace-nowrap font-display text-base leading-none tracking-tight text-logo">
          MurreeFoods<span className="text-accent">.com</span>
        </span>
      )}
    </Link>
  );
}
