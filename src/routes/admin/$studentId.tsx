import { UserButton, useUser } from "@clerk/clerk-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Brain,
	CheckCircle2,
	Clock,
	Copy,
	Download,
	FileText,
	Key,
	Trash2,
	Upload,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DatePickerWithLabel } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
	deleteStudentDocument,
	generateDocumentUploadUrl,
	getDocumentUrl,
	getStudentForAdmin,
	regenerateAccessCode,
	saveStudentDocument,
	setCurrentDocument,
	updateStudent,
} from "@/server/convex";

export const Route = createFileRoute("/admin/$studentId")({
	component: EditStudentPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			accessCode: (search.accessCode as string) || undefined,
		};
	},
});

const INTELLIGENCE_TYPES = [
	{
		value: "logico-matematica",
		label: "Lógico-matemática",
		description: "Raciocínio e resolução de problemas",
	},
	{
		value: "verbo-linguistica",
		label: "Verbo-linguística",
		description: "Linguagem, leitura e expressão verbal",
	},
	{
		value: "linguagens",
		label: "Linguagens",
		description: "Comunicação multimodal e simbólica",
	},
	{
		value: "espacial",
		label: "Espacial",
		description: "Visualização e orientação no espaço",
	},
	{
		value: "corporal-cinestesica",
		label: "Corporal-cinestésica",
		description: "Controle motor e expressão corporal",
	},
	{
		value: "musical",
		label: "Musical",
		description: "Ritmo, melodia e percepção sonora",
	},
	{
		value: "interpessoal",
		label: "Interpessoal",
		description: "Habilidade social e cooperação",
	},
	{
		value: "intrapessoal",
		label: "Intrapessoal",
		description: "Autoconhecimento e regulação emocional",
	},
	{
		value: "naturalista",
		label: "Naturalista",
		description: "Conexão com a natureza",
	},
	{
		value: "existencial",
		label: "Existencial",
		description: "Reflexão sobre perguntas profundas",
	},
	{
		value: "memoria",
		label: "Memória",
		description: "Capacidade de reter e recuperar informação",
	},
	{
		value: "espiritual",
		label: "Espiritual",
		description: "Dimensões espirituais ou transcendentais",
	},
];

function EditStudentPage() {
	const { studentId } = Route.useParams();
	const { accessCode: urlAccessCode } = Route.useSearch();
	const { isSignedIn, isLoaded, isAdmin, getClerkToken } = useAdminAuth();
	const { user } = useUser();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadNotes, setUploadNotes] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [selectedIntelligences, setSelectedIntelligences] = useState<string[]>(
		[],
	);
	const [accessCode, setAccessCode] = useState<string | null>(null);
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
	const pdfFileId = useId();
	const uploadNotesId = useId();

	const { data: studentData, isLoading } = useQuery({
		queryKey: ["studentForAdmin", studentId],
		queryFn: async () => {
			const clerkToken = await getClerkToken();
			return await getStudentForAdmin({
				data: { studentId, clerkToken },
			});
		},
		enabled: isSignedIn && isAdmin,
	});

	// Set access code from URL immediately when available
	useEffect(() => {
		if (urlAccessCode) {
			setAccessCode(urlAccessCode);
		}
	}, [urlAccessCode]);

	useEffect(() => {
		if (studentData?.student) {
			setSelectedIntelligences(studentData.student.intelligenceTypes || []);
			// Parse date of birth
			if (studentData.student.dateOfBirth) {
				const [year, month, day] = studentData.student.dateOfBirth
					.split("-")
					.map(Number);
				setDateOfBirth(new Date(year, month - 1, day));
			}
		}
	}, [studentData]);

	const updateStudentMutation = useMutation({
		mutationFn: async (values: {
			name?: string;
			dateOfBirth?: string;
			grade?: string;
			status?: "active" | "inactive" | "graduated";
			notes?: string;
		}) => {
			const clerkToken = await getClerkToken();
			return await updateStudent({
				data: {
					studentId,
					clerkToken,
					...values,
					intelligenceTypes:
						selectedIntelligences.length > 0
							? selectedIntelligences
							: undefined,
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["studentForAdmin", studentId],
			});
			toast.success("Aluno atualizado com sucesso!");
		},
	});

	const regenerateCodeMutation = useMutation({
		mutationFn: async () => {
			const clerkToken = await getClerkToken();
			return await regenerateAccessCode({
				data: { studentId, clerkToken },
			});
		},
		onSuccess: (data) => {
			setAccessCode(data.accessCode);
			toast.success("Código regenerado com sucesso!");
		},
	});

	const setCurrentDocMutation = useMutation({
		mutationFn: async (documentId: string) => {
			const clerkToken = await getClerkToken();
			return await setCurrentDocument({
				data: { documentId, studentId, clerkToken },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["studentForAdmin", studentId],
			});
		},
	});

	const deleteDocMutation = useMutation({
		mutationFn: async (documentId: string) => {
			const clerkToken = await getClerkToken();
			return await deleteStudentDocument({
				data: { documentId, clerkToken },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["studentForAdmin", studentId],
			});
		},
	});

	const form = useForm({
		defaultValues: {
			name: studentData?.student?.name || "",
			dateOfBirth: studentData?.student?.dateOfBirth || "",
			grade: studentData?.student?.grade || "",
			status: studentData?.student?.status || "active",
			notes: studentData?.student?.notes || "",
		},
		onSubmit: async ({ value }) => {
			await updateStudentMutation.mutateAsync(value);
		},
	});

	useEffect(() => {
		if (studentData?.student) {
			form.setFieldValue("name", studentData.student.name);
			form.setFieldValue("dateOfBirth", studentData.student.dateOfBirth);
			form.setFieldValue("grade", studentData.student.grade);
			form.setFieldValue("status", studentData.student.status);
			form.setFieldValue("notes", studentData.student.notes || "");
			// Parse date of birth
			if (studentData.student.dateOfBirth) {
				const [year, month, day] = studentData.student.dateOfBirth
					.split("-")
					.map(Number);
				setDateOfBirth(new Date(year, month - 1, day));
			}
		}
	}, [studentData, form.setFieldValue]);

	const handleFileUpload = async () => {
		if (!selectedFile || !user?.primaryEmailAddress?.emailAddress) return;

		setIsUploading(true);
		try {
			const clerkToken = await getClerkToken();

			// Step 1: Generate upload URL
			const uploadUrl = await generateDocumentUploadUrl({
				data: { clerkToken },
			});

			// Step 2: Upload file
			const result = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": selectedFile.type },
				body: selectedFile,
			});

			const { storageId } = await result.json();

			// Step 3: Save document metadata
			await saveStudentDocument({
				data: {
					studentId,
					storageId,
					fileName: selectedFile.name,
					fileSize: selectedFile.size,
					uploadedBy: user.primaryEmailAddress.emailAddress,
					clerkToken,
					notes: uploadNotes || undefined,
				},
			});

			// Clear form
			setSelectedFile(null);
			setUploadNotes("");
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			// Refresh data
			queryClient.invalidateQueries({
				queryKey: ["studentForAdmin", studentId],
			});
			toast.success("Documento adicionado com sucesso!");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Erro ao fazer upload do documento. Tente novamente.");
		} finally {
			setIsUploading(false);
		}
	};

	const toggleIntelligence = (value: string) => {
		setSelectedIntelligences((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!isLoaded || isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	if (!isSignedIn || !isAdmin) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card>
					<CardHeader>
						<CardTitle>Acesso Negado</CardTitle>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link to="/admin/login">Fazer Login</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!studentData) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Aluno não encontrado.</p>
			</div>
		);
	}

	const currentDocument = studentData.documents.find((doc) => doc.isCurrent);
	const previousDocuments = studentData.documents.filter(
		(doc) => !doc.isCurrent,
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon" asChild>
								<Link to="/admin">
									<ArrowLeft className="size-4" />
									<span className="sr-only">Voltar</span>
								</Link>
							</Button>
							<div>
								<h1 className="text-2xl font-bold">Editar Aluno</h1>
								<p className="text-sm text-muted-foreground">
									{studentData.student.name}
								</p>
							</div>
						</div>
						<UserButton />
					</div>
				</div>
			</div>

			<main className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Student Information */}
					<Card>
						<CardHeader>
							<CardTitle>Informações do Aluno</CardTitle>
							<CardDescription>
								Atualize os dados cadastrais do aluno
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									form.handleSubmit();
								}}
								className="space-y-4"
							>
								<form.Field name="name">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Nome Completo</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Nome do aluno"
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="dateOfBirth">
									{(field) => (
										<DatePickerWithLabel
											id={field.name}
											label="Data de Nascimento"
											value={dateOfBirth}
											onChange={(date) => {
												setDateOfBirth(date);
												// Convert to YYYY-MM-DD format for form
												if (date) {
													const year = date.getFullYear();
													const month = String(date.getMonth() + 1).padStart(
														2,
														"0",
													);
													const day = String(date.getDate()).padStart(2, "0");
													field.handleChange(`${year}-${month}-${day}`);
												} else {
													field.handleChange("");
												}
											}}
											placeholder="Selecione a data"
										/>
									)}
								</form.Field>

								<form.Field name="grade">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Série</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Ex: 5º ano"
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="status">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Status</Label>
											<Select
												value={field.state.value}
												onValueChange={(value) =>
													field.handleChange(
														value as "active" | "inactive" | "graduated",
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione o status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="active">Ativo</SelectItem>
													<SelectItem value="inactive">Inativo</SelectItem>
													<SelectItem value="graduated">Formado</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>

								<form.Field name="notes">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Observações</Label>
											<Textarea
												id={field.name}
												value={field.state.value || ""}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Observações sobre o aluno"
												rows={3}
											/>
										</div>
									)}
								</form.Field>

								<div className="flex justify-end pt-2">
									<Button type="submit" className="w-full sm:w-auto">
										Salvar Alterações
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Intelligence Types */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Brain className="h-5 w-5" />
								Tipos de Inteligência
							</CardTitle>
							<CardDescription>
								Selecione os tipos de inteligência identificados neste aluno
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{INTELLIGENCE_TYPES.map((type) => (
									<button
										type="button"
										key={type.value}
										onClick={() => toggleIntelligence(type.value)}
										className={`p-3 border rounded-lg cursor-pointer transition-colors text-left w-full ${
											selectedIntelligences.includes(type.value)
												? "bg-primary/10 border-primary"
												: "hover:bg-muted"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<div className="font-medium text-sm">{type.label}</div>
												<div className="text-xs text-muted-foreground mt-1">
													{type.description}
												</div>
											</div>
											{selectedIntelligences.includes(type.value) && (
												<CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
											)}
										</div>
									</button>
								))}
							</div>
							<div className="flex justify-end pt-2 mt-4">
								<Button
									onClick={() => form.handleSubmit()}
									className="w-full sm:w-auto"
									variant="outline"
								>
									Salvar Tipos de Inteligência
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Access Code */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5" />
								Código de Acesso
							</CardTitle>
							<CardDescription>
								Código que o aluno usa para acessar sua página
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{accessCode ? (
								<div className="p-4 bg-primary/10 rounded-lg space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<p className="text-sm text-muted-foreground mb-2">
												Código de acesso atual:
											</p>
											<p className="text-2xl font-mono font-bold text-center tracking-wider">
												{accessCode}
											</p>
											<p className="text-xs text-muted-foreground text-center mt-2">
												Compartilhe este código com o aluno/responsável para
												acesso ao sistema
											</p>
										</div>
										<div className="flex gap-1">
											<Button
												onClick={() => {
													const codeWithoutDash = accessCode.replace(/-/g, "");
													navigator.clipboard.writeText(codeWithoutDash);
													toast.success(
														"Código copiado para a área de transferência!",
													);
												}}
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												title="Copiar código"
											>
												<Copy className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => regenerateCodeMutation.mutate()}
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												disabled={regenerateCodeMutation.isPending}
												title="Gerar novo código"
											>
												<Key className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							) : (
								<>
									<div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed">
										<p className="text-sm text-muted-foreground text-center">
											Nenhum código de acesso disponível no momento.
										</p>
										<p className="text-sm text-muted-foreground text-center mt-2">
											Clique no botão abaixo para gerar um código de acesso para
											este aluno.
										</p>
									</div>
									<div className="flex justify-end">
										<Button
											onClick={() => regenerateCodeMutation.mutate()}
											className="w-full sm:w-auto"
											disabled={regenerateCodeMutation.isPending}
										>
											<Key className="h-4 w-4 mr-2" />
											{regenerateCodeMutation.isPending
												? "Gerando..."
												: "Gerar Código de Acesso"}
										</Button>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Document Upload */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								Upload de Documento PDF
							</CardTitle>
							<CardDescription>
								Envie o documento do aluno (apenas PDF)
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={pdfFileId}>Selecionar Arquivo PDF</Label>
								<Input
									id={pdfFileId}
									type="file"
									accept=".pdf,application/pdf"
									ref={fileInputRef}
									onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
								/>
							</div>

							{selectedFile && (
								<div className="p-3 bg-muted rounded-lg">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{selectedFile.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatFileSize(selectedFile.size)}
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor={uploadNotesId}>Observações (opcional)</Label>
								<Textarea
									id={uploadNotesId}
									value={uploadNotes}
									onChange={(e) => setUploadNotes(e.target.value)}
									placeholder="Adicione observações sobre este documento"
									rows={2}
								/>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={handleFileUpload}
									disabled={!selectedFile || isUploading}
									className="w-full sm:w-auto"
								>
									{isUploading ? "Enviando..." : "Enviar Documento"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Documents Section */}
				<div className="mt-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Documentos do Aluno
							</CardTitle>
							<CardDescription>
								Gerencie os documentos PDF do aluno
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Current Document */}
							{currentDocument && (
								<div className="border rounded-lg p-4">
									<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
										<div className="flex items-start gap-3 flex-1 min-w-0">
											<FileText className="h-5 w-5 text-primary mt-1" />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<p className="font-medium">
														{currentDocument.fileName}
													</p>
													<Badge variant="default" className="gap-1">
														<CheckCircle2 className="h-3 w-3" />
														Atual
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{formatFileSize(currentDocument.fileSize)} •{" "}
													{formatDate(currentDocument.uploadDate)}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													Enviado por: {currentDocument.uploadedBy}
												</p>
												{currentDocument.notes && (
													<p className="text-sm mt-2 text-muted-foreground italic">
														{currentDocument.notes}
													</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
											<Button
												variant="outline"
												size="sm"
												onClick={async () => {
													const url = await getDocumentUrl({
														data: { storageId: currentDocument.storageId },
													});
													if (url) window.open(url, "_blank");
												}}
											>
												<Download className="h-4 w-4" />
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => {
													if (
														confirm(
															"Tem certeza que deseja excluir este documento?",
														)
													) {
														deleteDocMutation.mutate(currentDocument._id);
													}
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							)}

							{/* Previous Documents */}
							{previousDocuments.length > 0 && (
								<Accordion type="single" collapsible>
									<AccordionItem value="previous-docs">
										<AccordionTrigger>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												Versões Anteriores ({previousDocuments.length})
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-3 pt-2">
												{previousDocuments.map((doc) => (
													<div
														key={doc._id}
														className="border rounded-lg p-3 bg-muted/50"
													>
														<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
															<div className="flex items-start gap-3 flex-1 min-w-0">
																<FileText className="h-4 w-4 text-muted-foreground mt-1" />
																<div className="flex-1 min-w-0">
																	<p className="font-medium text-sm">
																		{doc.fileName}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		{formatFileSize(doc.fileSize)} •{" "}
																		{formatDate(doc.uploadDate)}
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Por: {doc.uploadedBy}
																	</p>
																	{doc.notes && (
																		<p className="text-xs mt-1 text-muted-foreground italic">
																			{doc.notes}
																		</p>
																	)}
																</div>
															</div>
															<div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		setCurrentDocMutation.mutate(doc._id)
																	}
																>
																	Definir como Atual
																</Button>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={async () => {
																		const url = await getDocumentUrl({
																			data: { storageId: doc.storageId },
																		});
																		if (url) window.open(url, "_blank");
																	}}
																>
																	<Download className="h-4 w-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => {
																		if (
																			confirm(
																				"Excluir esta versão do documento?",
																			)
																		) {
																			deleteDocMutation.mutate(doc._id);
																		}
																	}}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														</div>
													</div>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							)}

							{!currentDocument && previousDocuments.length === 0 && (
								<div className="text-center py-8 text-muted-foreground">
									<FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p>Nenhum documento enviado ainda.</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
