import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useConvex } from "@convex-dev/react-query";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Users,
	FileText,
	Activity,
	GraduationCap,
	UserPlus,
	FolderOpen,
	CheckCircle2,
	XCircle,
	Award,
} from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { isSignedIn, isLoaded } = useAuth();
	const convex = useConvex();

	const { data: adminStatus, isLoading: isCheckingAdmin } = useQuery({
		queryKey: ["adminStatus"],
		queryFn: async () => {
			if (!isSignedIn) return null;
			return await convex.query(api.admin.checkAdminStatus, {});
		},
		enabled: isSignedIn && isLoaded,
	});

	const { data: stats } = useQuery({
		queryKey: ["dashboardStats"],
		queryFn: async () => {
			return await convex.query(api.admin.getDashboardStats, {});
		},
		enabled: isSignedIn && adminStatus?.isAdmin,
	});

	const { data: students } = useQuery({
		queryKey: ["allStudents"],
		queryFn: async () => {
			return await convex.query(api.admin.getAllStudents, {});
		},
		enabled: isSignedIn && adminStatus?.isAdmin,
	});

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			window.location.href = "/admin/login";
		}
	}, [isSignedIn, isLoaded]);

	if (!isLoaded || isCheckingAdmin) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	if (!isSignedIn) {
		return null;
	}

	if (!adminStatus?.isAdmin) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
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

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return (
					<Badge variant="default" className="gap-1">
						<CheckCircle2 className="h-3 w-3" />
						Ativo
					</Badge>
				);
			case "inactive":
				return (
					<Badge variant="secondary" className="gap-1">
						<XCircle className="h-3 w-3" />
						Inativo
					</Badge>
				);
			case "graduated":
				return (
					<Badge variant="outline" className="gap-1">
						<Award className="h-3 w-3" />
						Formado
					</Badge>
				);
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">Painel Administrativo</h1>
							<p className="text-sm text-muted-foreground">
								Bem-vindo(a),{" "}
								{adminStatus.user?.name || adminStatus.user?.email}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<Button variant="outline" asChild>
								<Link to="/">Ver Site</Link>
							</Button>
							<UserButton afterSignOutUrl="/admin/login" />
						</div>
					</div>
				</div>
			</div>

			<main className="container mx-auto px-4 py-8">
				{/* Statistics Cards */}
				{stats && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
									Relatórios
								</CardTitle>
								<FileText className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.totalReports}</div>
								<p className="text-xs text-muted-foreground mt-1">
									Relatórios de progresso
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Atividades
								</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{stats.totalActivities}
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Atividades registradas
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
								<CardTitle>Gerenciar Alunos</CardTitle>
								<CardDescription>
									Visualize e edite informações dos alunos
								</CardDescription>
							</div>
							<Button
								onClick={() => alert("Funcionalidade em desenvolvimento")}
							>
								<UserPlus className="h-4 w-4 mr-2" />
								Novo Aluno
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{students && students.length > 0 ? (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Nome</TableHead>
											<TableHead>Série</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-center">Docs</TableHead>
											<TableHead className="text-center">Relatórios</TableHead>
											<TableHead className="text-center">Atividades</TableHead>
											<TableHead className="text-right">Ações</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{students.map((student) => (
											<TableRow key={student._id}>
												<TableCell className="font-medium">
													{student.name}
												</TableCell>
												<TableCell>{student.grade}</TableCell>
												<TableCell>{getStatusBadge(student.status)}</TableCell>
												<TableCell className="text-center">
													<Badge variant="outline">
														{student.documentCount}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge variant="outline">
														{student.reportsCount}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<Badge variant="outline">
														{student.activitiesCount}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															window.location.href = `/admin/${student._id}`;
														}}
													>
														Editar
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="text-center py-12">
								<GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-muted-foreground">
									Nenhum aluno cadastrado ainda.
								</p>
								<Button
									className="mt-4"
									onClick={() => alert("Funcionalidade em desenvolvimento")}
								>
									<UserPlus className="h-4 w-4 mr-2" />
									Cadastrar Primeiro Aluno
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
