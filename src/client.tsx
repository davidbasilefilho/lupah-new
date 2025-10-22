import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";

hydrateRoot(
	document,
	<StrictMode>
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<StartClient />
		</ThemeProvider>
	</StrictMode>,
);
