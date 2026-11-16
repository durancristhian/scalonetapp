"use client";

import { ShowOff } from "@/components/show-off";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";

const links = [
  { href: "/about", label: "Acerca de" },
  { href: "/contact", label: "Contacto" },
  { href: "/privacy", label: "Privacidad" },
];

export function Footer({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-6">
        <nav aria-label="Información" className="flex flex-wrap gap-x-6">
          {links.map(({ href, label }) => {
            const current = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={clsx(
                  "inline-flex min-h-12 items-center underline-offset-4 active:opacity-80",
                  !current && "underline",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {children}
          <ShowOff popoverSeparation className="justify-start px-0" />
        </div>
      </div>
    </footer>
  );
}
