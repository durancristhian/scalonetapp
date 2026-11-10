import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-be border-transparent">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 md:h-14">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center text-base font-bold leading-normal tracking-normal active:opacity-80"
        >
          scalonet.app
        </Link>
      </div>
    </header>
  );
}
