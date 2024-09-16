import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex gap-4 h-12 md:h-14 items-center justify-between">
          <Link href="/dashboard">
            <h1 className="font-bold">scalonet.app</h1>
          </Link>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};
