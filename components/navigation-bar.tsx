import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ComponentPropsWithoutRef, FC, ReactNode } from "react";

export const NavigationBar = () => {
  return (
    <div className="border-b border-slate-300 py-2">
      <div className="container mx-auto">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dashboard" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Partidos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  <li>
                    <ListItem
                      href="/matches"
                      title="Tus partidos"
                      description="Gestioná tus partidos para que salgan perfecto."
                    />
                  </li>
                  <li>
                    <ListItem
                      href="/matches/new"
                      title="Crear un partido"
                      description="Podés crear todos los que quieras."
                    />
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

type ListItemProps = {
  description: ReactNode;
  href: ComponentPropsWithoutRef<"a">["href"];
  title: ReactNode;
};

const ListItem: FC<ListItemProps> = ({ description, href, title }) => {
  return (
    <NavigationMenuLink asChild>
      <a
        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        href={href}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      </a>
    </NavigationMenuLink>
  );
};
