import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useConvex } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	GraduationCap,
	Calendar,
	TrendingUp,
	Activity,
	LogOut,
	FileText,
	Download,
	Brain,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
	beforeLoad: () => {
		// Check if student is logged in
		const studentData = sessionStorage.getItem("lupahStudent");
		if (!studentData) {
			throw redirect({ to: "/" });
		}
	},
});

interface Student {
	_id: Id<"students">;
	name: string;
	dateOfBirth: string;
	grade: string;
	status: "active" | "inactive" | "graduated";
	intelligenceTypes: string[];
	notes?: string;
}

interface CurrentDocument {
	_id: Id<"studentDocuments">;
	storageId: Id<"_storage">;
	fileName: string;
	fileSize: number;
	uploadDate: string;
	notes?: string;
}

const INTELLIGENCE_LABELS: Record<
	string,
	{ label: string; description: string }
> = {
	"logico-matematica": {
		label: "Lógico-matemática",
		description: "Raciocínio e resolução de problemas",
	},
	"verbo-linguistica": {
		label: "Verbo-linguística",
		description: "Linguagem, leitura e expressão verbal",
	},
	linguagens: {
		label: "Linguagens",
		description: "Comunicação multimodal e simbólica",
	},
	espacial: {
		label: "Espacial",
		description: "Visualização e orientação no espaço",
	},
	"corporal-cinestesica": {
		label: "Corporal-cinestésica",
		description: "Controle motor e expressão corporal",
	},
	musical: {
		label: "Musical",
		description: "Ritmo, melodia e percepção sonora",
	},
	interpessoal: {
		label: "Interpessoal",
		description: "Habilidade social e cooperação",
	},
	intrapessoal: {
		label: "Intrapessoal",
		description: "Autoconhecimento e regulação emocional",
	},
	naturalista: {
		label: "Naturalista",
		description: "Conexão com a natureza",
	},
	existencial: {
		label: "Existencial",
		description: "Reflexão sobre perguntas profundas",
	},
	memoria: {
		label: "Memória",
		description: "Capacidade de reter e recuperar informação",
	},
	espiritual: {
		label: "Espiritual",
		description: "Dimensões espirituais ou transcendentais",
	},
};

function DashboardPage() {
	const [student, setStudent] = useState<Student | null>(null);
	const [currentDocument, setCurrentDocument] =
		useState<CurrentDocument | null>(null);
	const convex = useConvex();

	useEffect(() => {
		const studentData = sessionStorage.getItem("lupahStudent");
		const documentData = sessionStorage.getItem("lupahCurrentDocument");

		if (studentData) {
			const studentObj = JSON.parse(studentData);
			setStudent(studentObj);
		}

		if (documentData) {
			const docObj = JSON.parse(documentData);
			setCurrentDocument(docObj);
		}
	}, []);

	const { data: studentStats } = useQuery({
		queryKey: ["studentStats", student?._id],
		queryFn: async () => {
			if (!student) return null;
			return await convex.query(api.students.getStudentStats, {
				studentId: student._id,
			});
		},
		enabled: !!student,
	});

	const { data: studentData } = useQuery({
		queryKey: ["studentData", student?._id],
		queryFn: async () => {
			if (!student) return null;
			return await convex.query(api.students.getStudent, {
				studentId: student._id,
			});
		},
		enabled: !!student,
	});

	const handleLogout = () => {
		sessionStorage.removeItem("lupahStudent");
		sessionStorage.removeItem("lupahCurrentDocument");
		window.location.href = "/";
	};

	const calculateAge = (dateOfBirth: string) => {
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
		return (bytes / (1024 * 1024)).toFixed(1) + " MB";
	};

	if (!student) {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold mb-2">
							Olá, {student.name.split(" ")[0]}! 👋
						</h1>
						<p className="text-muted-foreground">
							Bem-vindo(a) à sua página do Projeto LUPAH
						</p>
					</div>
					<Button
						variant="outline"
						onClick={handleLogout}
						className="mt-4 md:mt-0"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Sair
					</Button>
				</div>

				{/* Student Info Card */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-2xl mb-2">{student.name}</CardTitle>
								<CardDescription className="space-y-1">
									<div className="flex items-center gap-2">
										<GraduationCap className="h-4 w-4" />
										<span>{student.grade}</span>
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										<span>{calculateAge(student.dateOfBirth)} anos</span>
									</div>
								</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* Intelligence Types */}
				{student.intelligenceTypes && student.intelligenceTypes.length > 0 && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Brain className="h-5 w-5" />
								Seus Tipos de Inteligência
							</CardTitle>
							<CardDescription>
								Suas habilidades e aptidões identificadas
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{student.intelligenceTypes.map((type) => {
									const info = INTELLIGENCE_LABELS[type];
									return (
										<div
											key={type}
											className="p-4 border rounded-lg bg-primary/5 border-primary/20"
										>
											<div className="font-semibold text-sm mb-1">
												{info?.label || type}
											</div>
											{info?.description && (
												<div className="text-xs text-muted-foreground">
													{info.description}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Current Document */}
				{currentDocument && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Seu Documento
							</CardTitle>
							<CardDescription>
								Documento atual enviado pela coordenação
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
								<div className="flex items-start gap-3 flex-1">
									<FileText className="h-5 w-5 text-primary mt-1" />
									<div className="flex-1 min-w-0">
										<p className="font-medium">{currentDocument.fileName}</p>
										<p className="text-sm text-muted-foreground">
											{formatFileSize(currentDocument.fileSize)} •{" "}
											{formatDate(currentDocument.uploadDate)}
										</p>
										{currentDocument.notes && (
											<p className="text-sm mt-2 text-muted-foreground italic">
												{currentDocument.notes}
											</p>
										)}
									</div>
								</div>
								<Button
									variant="default"
									size="sm"
									onClick={() => {
										const url = convex.storage.getUrl(
											currentDocument.storageId,
										);
										if (url) window.open(url, "_blank");
									}}
								>
									<Download className="h-4 w-4 mr-2" />
									Baixar
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Stats Cards */}
				{studentStats && (
					<div className="grid md:grid-cols-4 gap-4 mb-8">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Relatórios
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">
										{studentStats.totalReports}
									</div>
									<FileText className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Atividades
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">
										{studentStats.totalActivities}
									</div>
									<Activity className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Horas Totais
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">
										{studentStats.totalActivityHours}h
									</div>
									<Calendar className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Média Geral
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">
										{(
											(studentStats.averageScores.cognitive +
												studentStats.averageScores.socialEmotional +
												studentStats.averageScores.creativity +
												studentStats.averageScores.leadership) /
											4
										).toFixed(1)}
									</div>
									<TrendingUp className="h-8 w-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Performance Overview */}
				{studentStats && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Desempenho por Área</CardTitle>
							<CardDescription>
								Média das avaliações em cada competência
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Habilidades Cognitivas
									</span>
									<span className="text-sm font-bold">
										{studentStats.averageScores.cognitive.toFixed(1)}/10
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-blue-500 h-2 rounded-full transition-all"
										style={{
											width: `${studentStats.averageScores.cognitive * 10}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Habilidades Socioemocionais
									</span>
									<span className="text-sm font-bold">
										{studentStats.averageScores.socialEmotional.toFixed(1)}/10
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-green-500 h-2 rounded-full transition-all"
										style={{
											width: `${studentStats.averageScores.socialEmotional * 10}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">Criatividade</span>
									<span className="text-sm font-bold">
										{studentStats.averageScores.creativity.toFixed(1)}/10
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-purple-500 h-2 rounded-full transition-all"
										style={{
											width: `${studentStats.averageScores.creativity * 10}%`,
										}}
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">Liderança</span>
									<span className="text-sm font-bold">
										{studentStats.averageScores.leadership.toFixed(1)}/10
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-orange-500 h-2 rounded-full transition-all"
										style={{
											width: `${studentStats.averageScores.leadership * 10}%`,
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Recent Activities and Reports */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Recent Progress Reports */}
					<Card>
						<CardHeader>
							<CardTitle>Últimos Relatórios</CardTitle>
							<CardDescription>
								Relatórios de progresso mais recentes
							</CardDescription>
						</CardHeader>
						<CardContent>
							{studentData?.progressReports &&
							studentData.progressReports.length > 0 ? (
								<div className="space-y-4">
									{studentData.progressReports.slice(0, 3).map((report) => (
										<div
											key={report._id}
											className="border rounded-lg p-4 space-y-2"
										>
											<div className="flex items-center justify-between">
												<span className="font-semibold">{report.period}</span>
												<span className="text-xs text-muted-foreground">
													{formatDate(report.reportDate)}
												</span>
											</div>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.generalObservations}
											</p>
											<div className="flex items-center gap-2">
												<span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
													Progresso: {report.overallProgress}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground text-center py-8">
									Nenhum relatório disponível ainda.
								</p>
							)}
						</CardContent>
					</Card>

					{/* Recent Activities */}
					<Card>
						<CardHeader>
							<CardTitle>Atividades Recentes</CardTitle>
							<CardDescription>Suas últimas participações</CardDescription>
						</CardHeader>
						<CardContent>
							{studentData?.activities && studentData.activities.length > 0 ? (
								<div className="space-y-4">
									{studentData.activities.slice(0, 3).map((activity) => (
										<div
											key={activity._id}
											className="border rounded-lg p-4 space-y-2"
										>
											<div className="flex items-center justify-between">
												<span className="font-semibold text-sm">
													{activity.title}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatDate(activity.activityDate)}
												</span>
											</div>
											<p className="text-sm text-muted-foreground">
												{activity.description}
											</p>
											<div className="flex items-center gap-2 text-xs">
												<span className="bg-muted px-2 py-1 rounded capitalize">
													{activity.type === "workshop"
														? "Oficina"
														: activity.type === "assessment"
															? "Avaliação"
															: activity.type === "project"
																? "Projeto"
																: activity.type === "event"
																	? "Evento"
																	: "Outro"}
												</span>
												{activity.durationMinutes && (
													<span className="text-muted-foreground">
														{activity.durationMinutes} min
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground text-center py-8">
									Nenhuma atividade registrada ainda.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
