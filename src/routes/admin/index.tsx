import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	FileText,
	FolderOpen,
	GraduationCap,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import {
	studentsColumns,
	type StudentRow,
} from "@/components/data-table/students-columns";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getAllStudents, getDashboardStats } from "@/server/convex";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { isSignedIn, isLoaded, isAdmin, getClerkToken } = useAdminAuth();
	const { user } = useUser();

	// Fetch dashboard stats
	const { data: stats } = useQuery({
		queryKey: ["dashboardStats"],
		queryFn: async () => {
			const clerkToken = await getClerkToken();
			return await getDashboardStats({ data: { clerkToken } });
		},
		enabled: isSignedIn && isAdmin,
	});

	// Fetch all students
	const { data: students } = useQuery({
		queryKey: ["allStudents"],
		queryFn: async () => {
			const clerkToken = await getClerkToken();
			return await getAllStudents({ data: { clerkToken } });
		},
		enabled: isSignedIn && isAdmin,
	});

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	if (!isSignedIn) {
		return null;
	}

	if (!isAdmin) {
		return (
			<div className="bg-background flex items-center justify-center p-4 pt-12">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<XCircle className="h-5 w-5" />
							Acesso Negado
						</CardTitle>
						<CardDescription>
							Você não tem permissões de administrador.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Entre em contato com o administrador do sistema para obter acesso.
							Seu usuário precisa ter role: "admin" no Clerk metadata.
						</p>
						<Button
							variant="outline"
							onClick={() => {
								window.location.href = "/";
							}}
						>
							Voltar para a Página Inicial
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Painel administrativo</h1>
					<p className="text-muted-foreground mt-1">
						Bem-vindo(a), {user?.primaryEmailAddress?.emailAddress}
					</p>
				</div>
				{/* Statistics Cards */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mb-8">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total de Alunos
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.totalStudents}</div>
								<p className="text-xs text-muted-foreground mt-1">
									{stats.activeStudents} ativos
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Documentos
								</CardTitle>
								<FolderOpen className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.totalDocuments}</div>
								<p className="text-xs text-muted-foreground mt-1">
									PDFs armazenados
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Students Table */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Gerenciar alunos</CardTitle>
								<CardDescription>
									Visualize e edite informações dos alunos
								</CardDescription>
							</div>
							<Button asChild>
								<Link to="/admin/new">
									<UserPlus className="h-4 w-4 mr-2" />
									Novo aluno
								</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{students && students.length > 0 ? (
							<DataTable
								columns={studentsColumns}
								data={students as StudentRow[]}
								searchKey="name"
								searchPlaceholder="Filtrar por nome..."
							/>
						) : (
							<div className="text-center py-12">
								<GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-muted-foreground">
									Nenhum aluno cadastrado ainda.
								</p>
								<Button className="mt-4" asChild>
									<Link to="/admin/new">
										<UserPlus className="h-4 w-4 mr-2" />
										Cadastrar primeiro aluno
									</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
