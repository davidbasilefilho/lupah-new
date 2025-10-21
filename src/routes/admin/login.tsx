import { SignIn } from "@clerk/clerk-react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
	component: AdminLoginPage,
});

function AdminLoginPage() {
	const { isSignedIn, isLoaded } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isLoaded && isSignedIn) {
			// Redirect to admin dashboard if already signed in
			navigate({ to: "/admin" });
		}
	}, [isSignedIn, isLoaded, navigate]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">Área Administrativa</h1>
					<p className="text-muted-foreground">
						Acesse com suas credenciais de administrador
					</p>
				</div>
				<div className="flex justify-center">
					<SignIn
						appearance={{
							elements: {
								rootBox: "w-full",
								card: "shadow-lg",
							},
						}}
						redirectUrl="/admin"
						signUpUrl="/admin/login"
					/>
				</div>
			</div>
		</div>
	);
}
