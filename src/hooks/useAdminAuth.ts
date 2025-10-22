import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

/**
 * Hook for admin authentication
 * Returns Clerk token for server function calls and admin status
 */
export function useAdminAuth() {
	const { isSignedIn, isLoaded, getToken } = useAuth();
	const { user } = useUser();
	const navigate = useNavigate();

	// Check if user is admin based on Clerk metadata
	const isAdmin = user?.publicMetadata?.role === "admin";

	// Redirect to login if not signed in
	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			navigate({ to: "/admin/login" });
		}
	}, [isSignedIn, isLoaded, navigate]);

	/**
	 * Get Clerk token for Convex authentication
	 * This token is passed to server functions which then authenticate with Convex
	 */
	const getClerkToken = useCallback(async () => {
		if (!isSignedIn) {
			throw new Error("Não autenticado");
		}

		// Get token with Convex template
		// Note: You may need to configure this in your Clerk dashboard
		// under JWT Templates to create a "convex" template
		const token = await getToken({ template: "convex" });

		if (!token) {
			throw new Error("Falha ao obter token de autenticação");
		}

		return token;
	}, [isSignedIn, getToken]);

	return {
		isSignedIn,
		isLoaded,
		isAdmin,
		user,
		getClerkToken,
	};
}
