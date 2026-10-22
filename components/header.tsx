import {
  LargeScreenNavigation,
  SmallScreenNavigation,
} from "@/components/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="backdrop-blur-sm bg-white/75 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex gap-4 h-12 md:h-14 items-center justify-between">
          <div className="flex min-w-0 gap-2 items-center">
            <div className="md:hidden">
              <SmallScreenNavigation />
            </div>
            <Link href="/dashboard">
              <h1 className="font-bold">scalonet.app</h1>
            </Link>
            <div className="hidden md:block">
              <LargeScreenNavigation />
            </div>
          </div>
          <SignedIn>
            <div className="shrink-0">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonOuterIdentifier: "hidden max-w-40 truncate md:block",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};
