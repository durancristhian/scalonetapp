import Link from "next/link";
import { ShowOff } from "@/components/show-off";

const links = [
  { href: "/about", label: "Acerca de" },
  { href: "/contact", label: "Contacto" },
  { href: "/privacy", label: "Privacidad" },
];

export function PublicFooter() {
  return (
    <footer className="border-bs border-border">
      <div className="mx-auto flex w-[min(100%_-_2rem,80rem)] flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8">
        <nav aria-label="Información" className="flex flex-wrap gap-x-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-12 items-center underline underline-offset-4 active:opacity-80"
            >
              {label}
            </Link>
          ))}
        </nav>
        <ShowOff className="justify-start px-0" />
      </div>
    </footer>
  );
}
