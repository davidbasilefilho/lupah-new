import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Copy,
	Key,
	Loader2,
	UserPlus,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
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
import { createStudent } from "@/server/convex";

export const Route = createFileRoute("/admin/new")({
	component: NewStudentPage,
});

function NewStudentPage() {
	const { isSignedIn, isLoaded, isAdmin, getClerkToken } = useAdminAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const nameId = useId();
	const dateOfBirthId = useId();
	const gradeId = useId();
	const notesId = useId();
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);
	const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);

	const createStudentMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			dateOfBirth: string;
			grade: string;
			notes?: string;
		}) => {
			const clerkToken = await getClerkToken();
			return await createStudent({
				data: {
					name: values.name,
					dateOfBirth: values.dateOfBirth,
					grade: values.grade,
					clerkToken,
					notes: values.notes || undefined,
				},
			});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["allStudents"] });
			setGeneratedCode(data.accessCode);
			setCreatedStudentId(data.studentId);
			setShowSuccess(true);
			toast.success("Aluno criado com sucesso!");
		},
		onError: (error) => {
			console.error("Error creating student:", error);
			toast.error("Erro ao criar aluno. Tente novamente.");
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			dateOfBirth: "",
			grade: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			createStudentMutation.mutate(value);
		},
	});

	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Carregando...</p>
			</div>
		);
	}

	if (!isSignedIn || !isAdmin) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<Card className="max-w-md">
					<CardHeader>
						<CardTitle>Acesso Negado</CardTitle>
						<CardDescription>
							Você precisa estar autenticado como administrador.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							onClick={() => navigate({ to: "/admin" })}
						>
							Voltar
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						size="sm"
						className="mb-4"
						onClick={() => navigate({ to: "/admin" })}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar para Dashboard
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">
						Cadastrar Novo Aluno
					</h1>
					<p className="text-muted-foreground mt-2">
						Cadastre um novo aluno no programa LUPAH e gere seu código de acesso
					</p>
				</div>

				{showSuccess && generatedCode ? (
					<>
						{/* Success Card */}
						<Card className="mb-6 border-green-200 dark:border-green-800">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
									<CheckCircle2 className="h-5 w-5" />
									<CardTitle className="text-xl">
										Aluno Cadastrado com Sucesso!
									</CardTitle>
								</div>
								<CardDescription>
									O código de acesso foi gerado e está pronto para ser
									compartilhado
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-6 bg-primary/10 rounded-lg">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<p className="text-sm font-medium text-muted-foreground mb-3">
												Código de Acesso Gerado:
											</p>
											<p className="text-3xl font-mono font-bold text-center tracking-wider mb-3">
												{generatedCode}
											</p>
											<p className="text-sm text-muted-foreground text-center">
												Compartilhe este código com o aluno/responsável para
												acesso ao sistema
											</p>
										</div>
										<Button
											onClick={() => {
												const codeWithoutDash = generatedCode.replace(/-/g, "");
												navigator.clipboard.writeText(codeWithoutDash);
												toast.success(
													"Código copiado para a área de transferência!",
												);
											}}
											variant="outline"
											size="icon"
											className="h-10 w-10"
											title="Copiar código"
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="flex flex-col gap-3">
									{createdStudentId && (
										<Button
											onClick={() =>
												navigate({
													to: `/admin/${createdStudentId}`,
													search: { accessCode: generatedCode || undefined },
												})
											}
										>
											Ver Detalhes do Aluno
										</Button>
									)}
									<div className="flex flex-col sm:flex-row gap-3">
										<Button
											onClick={() => navigate({ to: "/admin" })}
											variant="outline"
											className="flex-1"
										>
											<ArrowLeft className="h-4 w-4 mr-2" />
											Voltar ao Dashboard
										</Button>
										<Button
											onClick={() => {
												setShowSuccess(false);
												setGeneratedCode(null);
												setCreatedStudentId(null);
												form.reset();
												setSelectedDate(undefined);
											}}
											variant="outline"
											className="flex-1"
										>
											<UserPlus className="h-4 w-4 mr-2" />
											Cadastrar Outro Aluno
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</>
				) : (
					<>
						{/* Form */}
						<Card>
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-2 text-xl">
									<UserPlus className="h-5 w-5" />
									Informações do Aluno
								</CardTitle>
								<CardDescription>
									Preencha os dados básicos do aluno. Um código de acesso será
									gerado automaticamente após o cadastro.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										form.handleSubmit();
									}}
									className="space-y-6"
								>
									<div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
										{/* Name */}
										<form.Field
											name="name"
											validators={{
												onChange: ({ value }) =>
													!value ? "Nome é obrigatório" : undefined,
											}}
										>
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={nameId}>
														Nome completo{" "}
														<span className="text-destructive">*</span>
													</Label>
													<Input
														id={nameId}
														placeholder="Ex: Maria Silva Santos"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														onBlur={field.handleBlur}
													/>
													{field.state.meta.errors.length > 0 && (
														<p className="text-sm text-destructive">
															{field.state.meta.errors[0]}
														</p>
													)}
												</div>
											)}
										</form.Field>

										{/* Date of Birth */}
										<form.Field
											name="dateOfBirth"
											validators={{
												onChange: ({ value }) => {
													if (!value) {
														return "Data de nascimento é obrigatória";
													}
													if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
														return "Data deve estar no formato AAAA-MM-DD";
													}
													return undefined;
												},
											}}
										>
											{(field) => (
												<DatePickerWithLabel
													id={dateOfBirthId}
													label="Data de nascimento"
													value={selectedDate}
													onChange={(date) => {
														setSelectedDate(date);
														if (date) {
															const year = date.getFullYear();
															const month = String(
																date.getMonth() + 1,
															).padStart(2, "0");
															const day = String(date.getDate()).padStart(
																2,
																"0",
															);
															field.handleChange(`${year}-${month}-${day}`);
														} else {
															field.handleChange("");
														}
													}}
													placeholder="Selecione a data"
													required
													error={field.state.meta.errors[0]}
												/>
											)}
										</form.Field>

										{/* Grade */}
										<form.Field
											name="grade"
											validators={{
												onChange: ({ value }) =>
													!value ? "Série/Ano é obrigatório" : undefined,
											}}
										>
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={gradeId}>
														Série/ano escolar{" "}
														<span className="text-destructive">*</span>
													</Label>
													<Select
														value={field.state.value}
														onValueChange={(value) => field.handleChange(value)}
													>
														<SelectTrigger id={gradeId}>
															<SelectValue placeholder="Selecione a série" />
														</SelectTrigger>
														<SelectContent>
															{Array.from({ length: 9 }, (_, i) => (
																<SelectItem key={i} value={`${i + 1}º ano`}>
																	{i + 1}º ano
																</SelectItem>
															))}
															{Array.from({ length: 3 }, (_, i) => (
																<SelectItem
																	key={i}
																	value={`${i + 1}ª série EM`}
																>
																	{i + 1}ª série EM
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{field.state.meta.errors.length > 0 && (
														<p className="text-sm text-destructive">
															{field.state.meta.errors[0]}
														</p>
													)}
												</div>
											)}
										</form.Field>

										{/* Notes - spans both columns */}
										<form.Field name="notes">
											{(field) => (
												<div className="space-y-2 sm:col-span-1 lg:col-span-2">
													<Label htmlFor={notesId}>
														Observações (opcional)
													</Label>
													<Textarea
														id={notesId}
														placeholder="Informações adicionais sobre o aluno..."
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														onBlur={field.handleBlur}
														rows={3}
													/>
												</div>
											)}
										</form.Field>
									</div>

									{/* Info Box */}
									<div className="bg-muted/50 border border-border rounded-lg p-4">
										<div className="flex gap-3">
											<Key className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
											<div className="flex-1">
												<p className="text-sm font-medium mb-1">
													Código de Acesso
												</p>
												<p className="text-sm text-muted-foreground leading-relaxed">
													Após criar o aluno, um código de acesso único será
													gerado automaticamente. Este código permitirá que o
													aluno/responsável acesse o sistema de forma segura.
												</p>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => navigate({ to: "/admin" })}
											disabled={createStudentMutation.isPending}
											className="sm:w-auto"
										>
											Cancelar
										</Button>
										<Button
											type="submit"
											disabled={createStudentMutation.isPending}
											className="sm:w-auto"
										>
											{createStudentMutation.isPending ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Criando...
												</>
											) : (
												<>
													<UserPlus className="h-4 w-4 mr-2" />
													Criar Aluno
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</>
				)}
			</main>
		</div>
	);
}
