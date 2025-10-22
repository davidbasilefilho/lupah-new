import { SignIn, useAuth } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
		<div className="bg-background flex items-center justify-center p-4 pt-12">
			<div className="w-full flex flex-col justify-center items-center max-w-md mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">Área Administrativa</h1>
					<p className="text-muted-foreground">
						Acesse com suas credenciais de administrador
					</p>
					<p className="text-sm text-muted-foreground mt-4">
						Para ter acesso administrativo, seu usuário precisa ter a role
						"admin" configurada no Clerk Dashboard em Users → [Seu Usuário] →
						Public metadata → role: "admin"
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
						forceRedirectUrl="/admin"
						routing="hash"
					/>
				</div>
			</div>
		</div>
	);
}
