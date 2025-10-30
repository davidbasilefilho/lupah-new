import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/Header";
import ClerkProvider from "../integrations/clerk/provider";
import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Projeto LUPAH",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	notFoundComponent: NotFoundPage,
	shellComponent: RootDocument,
});

function NotFoundPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Search className="h-8 w-8 text-muted-foreground" />
					</div>
					<CardTitle className="text-2xl">Página Não Encontrada</CardTitle>
					<CardDescription className="text-base mt-2">
						A página que você está procurando não existe ou foi movida.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<Button asChild className="w-full">
						<Link to="/">
							<Home className="h-4 w-4 mr-2" />
							Voltar para Página Inicial
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link to="/admin">Ir para Admin Dashboard</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<head>
				<HeadContent />
			</head>
			<body>
				<ClerkProvider>
					<ConvexProvider>
						<Header />
						{children}
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
								TanStackQueryDevtools,
							]}
						/>
						<Toaster />
					</ConvexProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
