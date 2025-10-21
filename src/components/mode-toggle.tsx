import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity } from "react";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					className="justify-between w-full"
					onClick={() => setTheme("light")}
				>
					Light
					<Activity mode={theme === "light" ? "visible" : "hidden"}>
						<Check className="size-4" />
					</Activity>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="justify-between w-full"
					onClick={() => setTheme("dark")}
				>
					Dark
					<Activity mode={theme === "dark" ? "visible" : "hidden"}>
						<Check className="size-4" />
					</Activity>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="justify-between w-full"
					onClick={() => setTheme("system")}
				>
					System
					<Activity mode={theme === "system" ? "visible" : "hidden"}>
						<Check className="size-4" />
					</Activity>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
