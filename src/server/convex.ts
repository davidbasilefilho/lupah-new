// Server functions as secure proxy to Convex
// This keeps Convex operations server-side to protect secrets
import { createServerFn } from "@tanstack/react-start";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// Get Convex URL from environment
function getConvexUrl() {
	// In server context, try both process.env and import.meta.env
	const url =
		process?.env?.VITE_CONVEX_URL ||
		// @ts-expect-error - import.meta.env is available in Vite
		import.meta.env?.VITE_CONVEX_URL;

	if (!url) {
		throw new Error("VITE_CONVEX_URL not found in environment");
	}

	return url;
}

// Initialize Convex client with server-side credentials
const convex = new ConvexHttpClient(getConvexUrl());

// Helper to create authenticated Convex client from Clerk token
function getAuthenticatedConvexClient(clerkToken: string) {
	const authenticatedConvex = new ConvexHttpClient(getConvexUrl());
	authenticatedConvex.setAuth(clerkToken);
	return authenticatedConvex;
}

// Validate student access code
export const validateStudentAccessCode = createServerFn({ method: "POST" })
	.inputValidator((data: { accessCode: string }) => data)
	.handler(async ({ data }) => {
		try {
			const result = await convex.action(
				api.studentActions.validateStudentAccessCode,
				{
					accessCode: data.accessCode,
				},
			);
			return {
				success: true,
				student: result.student,
				currentDocument: result.currentDocument,
			};
		} catch (error: unknown) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Código inválido. Tente novamente.",
			};
		}
	});

// Get student data
export const getStudent = createServerFn({ method: "GET" })
	.inputValidator((data: { studentId: string }) => data)
	.handler(async ({ data }) => {
		const studentData = await convex.query(api.students.getStudent, {
			studentId: data.studentId as Id<"students">,
		});
		return studentData;
	});

// Get student stats
export const getStudentStats = createServerFn({ method: "GET" })
	.inputValidator((data: { studentId: string }) => data)
	.handler(async ({ data }) => {
		const stats = await convex.query(api.students.getStudentStats, {
			studentId: data.studentId as Id<"students">,
		});
		return stats;
	});

// Get document URL from storage
export const getDocumentUrl = createServerFn({ method: "GET" })
	.inputValidator((data: { storageId: string }) => data)
	.handler(async ({ data }) => {
		const url = await convex.query(api.students.getDocumentUrl, {
			storageId: data.storageId as Id<"_storage">,
		});
		return url;
	});

// Admin: Get all students
export const getAllStudents = createServerFn({ method: "POST" })
	.inputValidator((data: { clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const students = await authenticatedConvex.query(
			api.admin.getAllStudents,
			{},
		);
		return students;
	});

// Admin: Get student for editing
export const getStudentForAdmin = createServerFn({ method: "POST" })
	.inputValidator((data: { studentId: string; clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const studentData = await authenticatedConvex.query(
			api.admin.getStudentForAdmin,
			{
				studentId: data.studentId as Id<"students">,
			},
		);
		return studentData;
	});

// Admin: Update student
export const updateStudent = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			studentId: string;
			clerkToken: string;
			name?: string;
			dateOfBirth?: string;
			grade?: string;
			status?: "active" | "inactive" | "graduated";
			notes?: string;
			intelligenceTypes?: string[];
		}) => data,
	)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const { studentId, clerkToken: _clerkToken, ...updates } = data;
		const result = await authenticatedConvex.mutation(
			api.students.updateStudent,
			{
				studentId: studentId as Id<"students">,
				...updates,
				// biome-ignore lint/suspicious/noExplicitAny: Convex mutation types are complex
			} as any,
		);
		return result;
	});

// Admin: Regenerate access code
export const regenerateAccessCode = createServerFn({ method: "POST" })
	.inputValidator((data: { studentId: string; clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const result = await authenticatedConvex.action(
			api.studentActions.regenerateAccessCode,
			{
				studentId: data.studentId as Id<"students">,
			},
		);
		return result;
	});

// Admin: Generate document upload URL
export const generateDocumentUploadUrl = createServerFn({ method: "POST" })
	.inputValidator((data: { clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const url = await authenticatedConvex.mutation(
			api.students.generateDocumentUploadUrl,
			{},
		);
		return url;
	});

// Admin: Save uploaded document
export const saveStudentDocument = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			studentId: string;
			storageId: string;
			fileName: string;
			fileSize: number;
			uploadedBy: string;
			clerkToken: string;
			notes?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const result = await authenticatedConvex.mutation(
			api.students.saveStudentDocument,
			{
				studentId: data.studentId as Id<"students">,
				storageId: data.storageId as Id<"_storage">,
				fileName: data.fileName,
				fileSize: data.fileSize,
				uploadedBy: data.uploadedBy,
				notes: data.notes,
			},
		);
		return result;
	});

// Admin: Set current document
export const setCurrentDocument = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { documentId: string; studentId: string; clerkToken: string }) =>
			data,
	)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const result = await authenticatedConvex.mutation(
			api.admin.setCurrentDocument,
			{
				documentId: data.documentId as Id<"studentDocuments">,
				studentId: data.studentId as Id<"students">,
			},
		);
		return result;
	});

// Admin: Delete document
export const deleteStudentDocument = createServerFn({ method: "POST" })
	.inputValidator((data: { documentId: string; clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const result = await authenticatedConvex.mutation(
			api.students.deleteStudentDocument,
			{
				documentId: data.documentId as Id<"studentDocuments">,
			},
		);
		return result;
	});

// Admin: Get dashboard stats
export const getDashboardStats = createServerFn({ method: "POST" })
	.inputValidator((data: { clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const stats = await authenticatedConvex.query(
			api.admin.getDashboardStats,
			{},
		);
		return stats;
	});

// Admin: Check admin status (client-side uses Clerk directly, this is backup validation)
export const checkAdminStatus = createServerFn({ method: "POST" })
	.inputValidator((data: { clerkToken: string }) => data)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			return { isAdmin: false };
		}
		try {
			const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
			const result = await authenticatedConvex.query(
				api.admin.checkAdminStatus,
				{},
			);
			return result;
		} catch (_error) {
			return { isAdmin: false };
		}
	});

// Admin: Create new student
export const createStudent = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			name: string;
			dateOfBirth: string;
			grade: string;
			clerkToken: string;
			notes?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		if (!data.clerkToken) {
			throw new Error("Token de autenticação não fornecido");
		}
		const authenticatedConvex = getAuthenticatedConvexClient(data.clerkToken);
		const result = await authenticatedConvex.action(
			api.studentActions.createStudent,
			{
				name: data.name,
				dateOfBirth: data.dateOfBirth,
				enrollmentDate: new Date().toISOString().split("T")[0],
				grade: data.grade,
				status: "active",
				notes: data.notes,
			},
		);
		return result;
	});
