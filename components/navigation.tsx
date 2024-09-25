"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import clsx from "clsx";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Partidos",
    path: "/partidos",
  },
];

export const SmallScreenNavigation = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  if (!isSignedIn) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link">
          <MenuIcon className="h4 opacity-50 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>scalonet.app</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col mt-8 space-y-4">
          {NAVIGATION_ITEMS.map((navItem) => (
            <SheetClose asChild key={navItem.path}>
              <Link
                href={navItem.path}
                className={clsx(
                  isRouteActive(pathname, navItem.path) && "underline"
                )}
              >
                {navItem.label}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const LargeScreenNavigation = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  if (!isSignedIn) {
    return null;
  }

  return (
    <NavigationMenu className="ml-6">
      <NavigationMenuList>
        {NAVIGATION_ITEMS.map((navItem) => (
          <NavigationMenuItem key={navItem.path}>
            <Link href={navItem.path} legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                active={isRouteActive(pathname, navItem.path)}
              >
                {navItem.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const isRouteActive: (currPathname: string, navPathname: string) => boolean = (
  currPathname,
  navPathname
) => currPathname.startsWith(navPathname);
