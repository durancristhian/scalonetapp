import {
  LargeScreenNavigation,
  SmallScreenNavigation,
} from "@/components/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import styles from "./header.module.css";

export const Header = () => {
  return (
    <div
      data-app-header
      className="backdrop-blur-sm bg-white/75 border-b border-border sticky top-0 z-50"
    >
      <div className={styles.content}>
        <div className="flex min-w-0 gap-2 items-center">
          <div className="md:hidden">
            <SmallScreenNavigation />
          </div>
          <Link href="/dashboard">
            <h1 className={styles.brand}>scalonet.app</h1>
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
