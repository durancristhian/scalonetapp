import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="bg-slate-100 border-b border-slate-300 h-12">
      <div className="container h-full mx-auto">
        <div className="flex h-full items-center justify-between">
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
