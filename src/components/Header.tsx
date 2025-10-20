import { Link, type LinkProps } from "@tanstack/react-router";
import { Activity } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export type NavItem = LinkProps & {
  title: string;
  description?: string;
  children?: NavItem[];
  className?: string;
};

const pages: NavItem[] = [
  {
    to: "/",
    title: "LUPAH",
    className: "font-semibold",
  },
];

export default function Header() {
  const isMobile = useIsMobile();
  return (
    <header className="bg-background/50 backdrop-blur-2xl border-b shadow-sm sticky top-0 z-50">
      <nav className="container flex justify-between items-center p-4 mx-auto">
        <div className="flex items-center space-x-4">
          <NavigationMenu viewport={isMobile}>
            <NavigationMenuList className="flex-wrap">
              {pages.map((page) => (
                <NavigationMenuItem key={page.title} className="px-2">
                  {page.children && page.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger>
                        {page.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {page.children.map((child) => (
                          <NavigationMenuLink key={child.to} asChild>
                            <Link
                              to={child.to}
                              className={page.className ?? ""}
                            >
                              {child.title}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link to={page.to} className={page.className ?? ""}>
                        {page.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  );
}
