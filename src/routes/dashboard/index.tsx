import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Book,
	Brain,
	Download,
	Eye,
	FileText,
	Heart,
	Home,
	Layout,
	LogOut,
	Music,
	Trees,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getDocumentUrl, getStudent } from "@/server/convex";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

const INTELLIGENCE_ICONS: Record<string, React.ElementType> = {
	"logico-matematica": Brain,
	"verbo-linguistica": Book,
	linguagens: Layout,
	espacial: Eye,
	"corporal-cinestesica": User,
	musical: Music,
	interpessoal: Users,
	intrapessoal: Heart,
	naturalista: Trees,
	existencial: Brain,
	memoria: Brain,
	espiritual: Brain,
};

const INTELLIGENCE_LABELS: Record<string, string> = {
	"logico-matematica": "Lógico-matemática",
	"verbo-linguistica": "Verbo-linguística",
	linguagens: "Linguagens",
	espacial: "Espacial",
	"corporal-cinestesica": "Corporal-cinestésica",
	musical: "Musical",
	interpessoal: "Interpessoal",
	intrapessoal: "Intrapessoal",
	naturalista: "Naturalista",
	existencial: "Existencial",
	memoria: "Memória",
	espiritual: "Espiritual",
};

function DashboardPage() {
	const navigate = useNavigate();
	const [studentId, setStudentId] = useState<string | null>(null);
	const [documentUrl, setDocumentUrl] = useState<string | null>(null);

	useEffect(() => {
		const storedStudentId = sessionStorage.getItem("studentId");
		if (!storedStudentId) {
			navigate({ to: "/" });
			return;
		}
		setStudentId(storedStudentId);
	}, [navigate]);

	const { data: studentData, isLoading } = useQuery({
		queryKey: ["student", studentId],
		queryFn: async () => {
			if (!studentId) return null;
			return await getStudent({ data: { studentId } });
		},
		enabled: !!studentId,
	});

	// Fetch document URL if there's a current document
	useEffect(() => {
		const fetchDocumentUrl = async () => {
			if (studentData?.currentDocument?.storageId) {
				try {
					const url = await getDocumentUrl({
						data: { storageId: studentData.currentDocument.storageId },
					});
					setDocumentUrl(url);
				} catch (error) {
					console.error("Error fetching document URL:", error);
				}
			}
		};
		fetchDocumentUrl();
	}, [studentData?.currentDocument?.storageId]);

	const handleLogout = () => {
		sessionStorage.removeItem("studentId");
		navigate({ to: "/" });
	};

	const formatDate = (dateString: string) => {
		const [year, month, day] = dateString.split("-");
		return `${day}/${month}/${year}`;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	if (isLoading || !studentData) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	const { student, currentDocument } = studentData;

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card">
				<div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
							<User className="h-5 w-5 text-primary" />
						</div>
						<div className="min-w-0">
							<h1 className="font-semibold text-lg truncate">{student.name}</h1>
							<p className="text-sm text-muted-foreground">
								Programa LUPAH - Itu, SP
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						className="self-end sm:self-auto"
					>
						<LogOut className="h-4 w-4 mr-2" />
						Sair
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold tracking-tight mb-2">
						Bem-vindo(a), {student.name.split(" ")[0]}!
					</h2>
					<p className="text-muted-foreground">
						Aqui você pode acompanhar suas informações e acessar seus documentos
						do programa LUPAH.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Student Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Suas Informações
							</CardTitle>
							<CardDescription>Dados cadastrados no programa</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Nome Completo
									</p>
									<p className="text-sm font-medium mt-1">{student.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Data de Nascimento
									</p>
									<p className="text-sm font-medium mt-1">
										{formatDate(student.dateOfBirth)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Série/Ano
									</p>
									<p className="text-sm font-medium mt-1">{student.grade}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Status
									</p>
									<Badge
										variant={
											student.status === "active" ? "default" : "secondary"
										}
										className="mt-1"
									>
										{student.status === "active" ? "Ativo" : "Inativo"}
									</Badge>
								</div>
							</div>

							{student.notes && (
								<div className="pt-2 border-t">
									<p className="text-sm font-medium text-muted-foreground mb-1">
										Observações
									</p>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{student.notes}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Document Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Documento Atual
							</CardTitle>
							<CardDescription>
								Orientações e materiais do programa
							</CardDescription>
						</CardHeader>
						<CardContent>
							{currentDocument ? (
								<div className="space-y-4">
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-start gap-3">
											<div className="p-2 bg-background rounded">
												<FileText className="h-5 w-5 text-muted-foreground" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm truncate">
													{currentDocument.fileName}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													{formatFileSize(currentDocument.fileSize)} •{" "}
													{new Date(
														currentDocument.uploadDate,
													).toLocaleDateString("pt-BR")}
												</p>
												{currentDocument.notes && (
													<p className="text-xs text-muted-foreground mt-2">
														{currentDocument.notes}
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row gap-2">
										{documentUrl && (
											<>
												<Button
													asChild
													className="flex-1"
													onClick={() => window.open(documentUrl, "_blank")}
												>
													<a
														href={documentUrl}
														target="_blank"
														rel="noopener noreferrer"
													>
														<Eye className="h-4 w-4 mr-2" />
														Visualizar
													</a>
												</Button>
												<Button asChild variant="outline" className="flex-1">
													<a href={documentUrl} download>
														<Download className="h-4 w-4 mr-2" />
														Baixar
													</a>
												</Button>
											</>
										)}
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
										<FileText className="h-6 w-6 text-muted-foreground" />
									</div>
									<p className="text-sm text-muted-foreground">
										Nenhum documento disponível no momento
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Entre em contato com a coordenação para mais informações
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Intelligence Types */}
					{student.intelligenceTypes &&
						student.intelligenceTypes.length > 0 && (
							<Card className="lg:col-span-2">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Brain className="h-5 w-5" />
										Tipos de Inteligência
									</CardTitle>
									<CardDescription>
										Perfis cognitivos identificados pela equipe do LUPAH
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
										{student.intelligenceTypes.map((type: string) => {
											const Icon = INTELLIGENCE_ICONS[type] || Brain;
											const label = INTELLIGENCE_LABELS[type] || type;
											return (
												<div
													key={type}
													className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
												>
													<div className="p-2 rounded-full bg-primary/10">
														<Icon className="h-4 w-4 text-primary" />
													</div>
													<span className="text-sm font-medium">{label}</span>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						)}

					{/* Help Card */}
					<Card className="lg:col-span-2 border-dashed">
						<CardContent className="pt-6">
							<div className="flex items-start gap-4">
								<div className="p-2 rounded-full bg-muted">
									<Home className="h-5 w-5 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<h3 className="font-medium mb-1">
										Precisa de ajuda ou tem dúvidas?
									</h3>
									<p className="text-sm text-muted-foreground mb-3">
										Entre em contato com a coordenação do Programa LUPAH através
										do NAPE (Núcleo de Apoio Psicopedagógico Especializado) da
										Prefeitura de Itu.
									</p>
									<p className="text-xs text-muted-foreground">
										Este é um ambiente seguro. Seus dados são protegidos e
										utilizados apenas para fins pedagógicos do programa.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t mt-12">
				<div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
					<p>Projeto LUPAH - Lúdico Universo da Pessoa com Altas Habilidades</p>
					<p className="mt-1">Prefeitura da Estância Turística de Itu • NAPE</p>
				</div>
			</footer>
		</div>
	);
}
