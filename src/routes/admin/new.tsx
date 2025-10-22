import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useId, useState } from "react";
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

	const createStudentMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			dateOfBirth: string;
			grade: string;
			notes?: string;
		}) => {
			const clerkToken = await getClerkToken();
			// Convert date to YYYY-MM-DD format
			const dateStr = selectedDate
				? selectedDate.toISOString().split("T")[0]
				: "";
			return await createStudent({
				data: {
					name: values.name,
					dateOfBirth: dateStr,
					grade: values.grade,
					clerkToken,
					notes: values.notes || undefined,
				},
			});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["allStudents"] });
			alert(
				`Aluno criado com sucesso!\nCódigo de acesso: ${data.accessCode}\n\nAnote este código para entregar ao aluno/responsável.`,
			);
			// Redirect to student details page
			navigate({ to: `/admin/${data.studentId}` });
		},
		onError: (error) => {
			console.error("Error creating student:", error);
			alert("Erro ao criar aluno. Tente novamente.");
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			grade: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			if (!selectedDate) {
				alert("Por favor, selecione a data de nascimento");
				return;
			}
			createStudentMutation.mutate({
				...value,
				dateOfBirth: "",
			});
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
			<main className="container mx-auto px-4 py-8 max-w-3xl">
				{/* Header */}
				<div className="mb-8">
					<Button
						variant="ghost"
						size="sm"
						className="mb-4"
						onClick={() => navigate({ to: "/admin" })}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar para Dashboard
					</Button>
					<h1 className="text-3xl font-bold">Novo aluno</h1>
					<p className="text-muted-foreground mt-1">
						Cadastre um novo aluno no programa LUPAH
					</p>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5" />
							Informações do aluno
						</CardTitle>
						<CardDescription>
							Preencha os dados básicos do aluno. Um código de acesso será
							gerado automaticamente.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-5"
						>
							{/* Name */}
							<form.Field
								name="name"
								validators={{
									onChange: ({ value }) =>
										!value ? "Nome é obrigatório" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={nameId}>
											Nome completo <span className="text-destructive">*</span>
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
							<DatePickerWithLabel
								id={dateOfBirthId}
								label="Data de nascimento"
								value={selectedDate}
								onChange={setSelectedDate}
								placeholder="Selecione a data"
								required
							/>

							{/* Grade */}
							<form.Field
								name="grade"
								validators={{
									onChange: ({ value }) =>
										!value ? "Série/Ano é obrigatório" : undefined,
								}}
							>
								{(field) => (
									<div className="space-y-1.5">
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
												<SelectItem value="1º ano">1º ano</SelectItem>
												<SelectItem value="2º ano">2º ano</SelectItem>
												<SelectItem value="3º ano">3º ano</SelectItem>
												<SelectItem value="4º ano">4º ano</SelectItem>
												<SelectItem value="5º ano">5º ano</SelectItem>
												<SelectItem value="6º ano">6º ano</SelectItem>
												<SelectItem value="7º ano">7º ano</SelectItem>
												<SelectItem value="8º ano">8º ano</SelectItem>
												<SelectItem value="9º ano">9º ano</SelectItem>
												<SelectItem value="1ª série EM">1ª série EM</SelectItem>
												<SelectItem value="2ª série EM">2ª série EM</SelectItem>
												<SelectItem value="3ª série EM">3ª série EM</SelectItem>
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

							{/* Notes */}
							<form.Field name="notes">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={notesId}>Observações (opcional)</Label>
										<Textarea
											id={notesId}
											placeholder="Informações adicionais sobre o aluno..."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											rows={4}
										/>
									</div>
								)}
							</form.Field>

							{/* Info Box */}
							<div className="bg-muted/50 border border-border rounded-lg p-3.5">
								<p className="text-sm text-muted-foreground">
									<strong>Atenção:</strong> Após criar o aluno, um código de
									acesso de 8 caracteres será gerado automaticamente. Este
									código será usado pelo aluno/responsável para acessar o
									sistema.
								</p>
							</div>

							{/* Actions */}
							<div className="flex justify-end gap-3 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate({ to: "/admin" })}
									disabled={createStudentMutation.isPending}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={createStudentMutation.isPending}
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

				{/* Additional Info Card */}
				<Card className="mt-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Próximos passos</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
							<li>
								Após criar o aluno, você será redirecionado para a página de
								detalhes
							</li>
							<li>O código de acesso será exibido - anote-o para entregar</li>
							<li>
								Você poderá fazer upload de documentos e definir tipos de
								inteligência
							</li>
							<li>O código pode ser regenerado a qualquer momento</li>
						</ol>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
