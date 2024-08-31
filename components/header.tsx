import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="bg-slate-100 border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex h-10 md:h-12 items-center justify-between">
          <Link href="/">
            <h1 className="font-bold text-slate-950 tracking-wide">
              Scalonet.app
            </h1>
          </Link>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};
