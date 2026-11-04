import {
  LargeScreenNavigation,
  SmallScreenNavigation,
} from "@/components/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const Header = () => {
  return (
    <div
      data-app-header
      className="backdrop-blur-sm bg-white/75 border-b border-border sticky top-0 z-50"
    >
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 md:h-14">
        <div className="flex min-w-0 gap-2 items-center">
          <div className="md:hidden">
            <SmallScreenNavigation />
          </div>
          <Link href="/dashboard">
            <h1 className="text-base font-bold leading-normal tracking-normal">
              scalonet.app
            </h1>
          </Link>
          <div className="hidden md:block">
            <LargeScreenNavigation />
          </div>
        </div>
        <Show when="signed-in">
          <div className="shrink-0">
            <UserButton
              showName
              appearance={{
                elements: {
                  userButtonOuterIdentifier:
                    "hidden max-w-40 truncate md:block",
                },
              }}
            />
          </div>
        </Show>
      </div>
    </div>
  );
};
