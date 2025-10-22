import { UserButton, useUser } from "@clerk/clerk-react";
import { Link, type LinkProps, useRouterState } from "@tanstack/react-router";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export type NavItem = LinkProps & {
	title: string;
	description?: string;
	children?: NavItem[];
	className?: string;
	requireAdmin?: boolean;
};

const pages: NavItem[] = [
	{
		to: "/",
		title: "Início",
		description: "Página inicial do LUPAH",
	},
	{
		to: "/admin",
		title: "Administração",
		description: "Área administrativa",
		requireAdmin: true,
	},
];

export default function Header() {
	const isMobile = useIsMobile();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const router = useRouterState();
	const currentPath = router.location.pathname;
	const { user, isSignedIn } = useUser();

	// Check if user is admin
	const isAdmin = user?.publicMetadata?.role === "admin";

	// Filter pages based on admin status
	const visiblePages = pages.filter((page) => {
		if (page.requireAdmin) {
			return isSignedIn && isAdmin;
		}
		return true;
	});

	const isActive = (path: string) => {
		if (path === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(path);
	};

	return (
		<header className="bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm sticky top-0 z-50">
			<nav className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo - Left Side */}
					<Link
						to="/"
						className="flex items-center gap-2 group transition-all hover:opacity-80"
					>
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-all" />
							<GraduationCap className="h-8 w-8 text-primary relative" />
						</div>
						<div className="flex flex-col">
							<span className="text-xl font-bold">LUPAH</span>
							<span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
								Programa de Altas Habilidades
							</span>
						</div>
					</Link>

					{/* Desktop Navigation - Center */}
					{!isMobile && (
						<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
							{visiblePages.map((page) => {
								const active = isActive(page.to as string);
								return (
									<Link
										key={page.title}
										to={page.to}
										className={cn(
											"px-4 py-2 rounded-md text-sm font-medium transition-all relative group",
											active
												? "text-primary"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{page.title}
										{active && (
											<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
										)}
										<span className="absolute inset-0 rounded-md bg-primary/0 group-hover:bg-primary/5 transition-all" />
									</Link>
								);
							})}
						</div>
					)}

					{/* Right Side Actions */}
					<div className="flex items-center gap-2">
						{/* User Button - Only show if signed in */}
						{isSignedIn && (
							<UserButton
								appearance={{
									elements: {
										avatarBox: "w-8 h-8",
									},
								}}
							/>
						)}

						<ModeToggle />

						{/* Mobile Menu Button */}
						{isMobile && (
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Mobile Navigation with Animation */}
				{isMobile && (
					<div
						className={cn(
							"md:hidden overflow-hidden transition-all duration-300 ease-in-out",
							mobileMenuOpen
								? "max-h-96 opacity-100 border-t border-border/40 py-4"
								: "max-h-0 opacity-0",
						)}
					>
						<div className="space-y-2">
							{visiblePages.map((page) => {
								const active = isActive(page.to as string);
								return (
									<Link
										key={page.title}
										to={page.to}
										onClick={() => setMobileMenuOpen(false)}
										className={cn(
											"block px-4 py-3 rounded-lg text-sm font-medium transition-all",
											active
												? "bg-primary/10 text-primary"
												: "text-foreground hover:bg-accent",
										)}
									>
										<div className="font-semibold">{page.title}</div>
										{page.description && (
											<div className="text-xs text-muted-foreground mt-0.5">
												{page.description}
											</div>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
