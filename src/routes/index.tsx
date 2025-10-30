/** biome-ignore-all lint/suspicious/noArrayIndexKey: no other relevant property */
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
	Archive,
	Book,
	CheckCircle2,
	Cpu,
	Eye,
	Feather,
	Globe,
	Heart,
	Layout,
	Lock,
	Music,
	Shield,
	Speaker,
	Trees,
	User,
	Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { MagicCard } from "@/components/ui/magic-card";
import { validateStudentAccessCode } from "@/server/convex";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const codeLength = 8 as const;
	const formId = useId();
	const heroHeadingId = useId();
	const intelligencesHeadingId = useId();
	const otpId = useId();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [_isSubmitting, setIsSubmitting] = useState(false);

	const validators = {
		code: z
			.string()
			.length(codeLength, {
				message: `Use ${codeLength} caracteres alfanuméricos.`,
			})
			.regex(/^[A-Za-z0-9]+$/i, {
				message: "Apenas letras e números.",
			}),
	};

	const form = useForm({
		defaultValues: {
			code: "",
		},
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			setIsSubmitting(true);

			try {
				// Call server function to validate access code (proxy to Convex)
				const result = await validateStudentAccessCode({
					data: { accessCode: value.code },
				});

				if (result.success && result.student) {
					// Store student ID in sessionStorage for client-side
					sessionStorage.setItem("studentId", result.student._id);
					window.location.href = "/dashboard";
				} else {
					setErrorMessage("Erro: código de acesso inválido.");
				}
			} catch (error: unknown) {
				setErrorMessage("Erro: código de acesso inválido.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const intelligenceTypes = [
		{
			name: "Lógico-matemática",
			Icon: Cpu,
			className: "md:col-span-2 md:row-span-2",
			description: "Raciocínio e resolução de problemas.",
			href: "#logico-matematica",
			cta: "Saiba mais",
		},
		{
			name: "Verbo-linguística",
			Icon: Book,
			className: "md:col-span-1 md:row-span-2",
			description: "Linguagem, leitura e expressão verbal.",
			href: "#verbo-linguistica",
			cta: "Saiba mais",
		},
		{
			name: "Linguagens",
			Icon: Layout,
			className: "md:col-span-1 md:row-span-2",
			description: "Comunicação multimodal e simbólica.",
			href: "#linguagens",
			cta: "Saiba mais",
		},
		{
			name: "Espacial",
			Icon: Eye,
			className: "md:col-span-2 md:row-span-1",
			description: "Visualização e orientação no espaço.",
			href: "#espacial",
			cta: "Saiba mais",
		},
		{
			name: "Corporal-cinestésica",
			Icon: Feather,
			className: "md:col-span-1 md:row-span-1",
			description: "Controle motor e expressão corporal.",
			href: "#corporal-cinestesica",
			cta: "Saiba mais",
		},
		{
			name: "Musical",
			Icon: Music,
			className: "md:col-span-1 md:row-span-2",
			description: "Ritmo, melodia e percepção sonora.",
			href: "#musical",
			cta: "Saiba mais",
		},
		{
			name: "Interpessoal",
			Icon: User,
			className: "md:col-span-2 md:row-span-1",
			description: "Habilidade social e cooperação.",
			href: "#interpessoal",
			cta: "Saiba mais",
		},
		{
			name: "Intrapessoal",
			Icon: Heart,
			className: "md:col-span-1 md:row-span-1",
			description: "Autoconhecimento e regulação emocional.",
			href: "#intrapessoal",
			cta: "Saiba mais",
		},
		{
			name: "Naturalista",
			Icon: Trees,
			className: "md:col-span-1 md:row-span-2",
			description: "Conexão com a natureza e categorizar o mundo natural.",
			href: "#naturalista",
			cta: "Saiba mais",
		},
		{
			name: "Existencial",
			Icon: Globe,
			className: "md:col-span-2 md:row-span-2",
			description: "Reflexão sobre perguntas profundas e significado.",
			href: "#existencial",
			cta: "Saiba mais",
		},
		{
			name: "Memória",
			Icon: Archive,
			className: "md:col-span-1 md:row-span-1",
			description: "Capacidade de reter e recuperar informação.",
			href: "#memoria",
			cta: "Saiba mais",
		},
		{
			name: "Espiritual",
			Icon: Speaker,
			className: "md:col-span-1 md:row-span-1",
			description: "Dimensões espirituais ou transcendentais.",
			href: "#espiritual",
			cta: "Saiba mais",
		},
	];
	const id = useId();

	return (
		<div>
			<div
				aria-hidden
				className="pointer-events-none absolute top-0 left-0 right-0 h-[1000px] -z-10 overflow-hidden"
			>
				{/* Vibrant Orange Circle - Top Left */}
				<motion.div
					className="absolute -top-128 -left-60 size-[1000px] rounded-full opacity-40"
					style={{
						background:
							"radial-gradient(circle, hsl(25, 95%, 60%) 0%, transparent 65%)",
						filter: "blur(100px)",
					}}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 0.4, scale: 1 }}
					transition={{ duration: 1, ease: "easeOut" }}
				/>

				{/* Bright Magenta Circle - Top Center */}
				<motion.div
					className="absolute -top-140 left-1/2 -translate-x-1/2 size-[1100px] rounded-full opacity-35"
					style={{
						background:
							"radial-gradient(circle, hsl(320, 90%, 65%) 0%, transparent 65%)",
						filter: "blur(110px)",
					}}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 0.35, scale: 1 }}
					transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
				/>

				{/* Electric Blue Circle - Top Right */}
				<motion.div
					className="absolute -top-140 -right-60 size-[1000px] rounded-full opacity-30"
					style={{
						background:
							"radial-gradient(circle, hsl(200, 95%, 60%) 0%, transparent 65%)",
						filter: "blur(95px)",
					}}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 0.38, scale: 1 }}
					transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
				/>
			</div>
			<main
				id={id}
				className="w-full max-w-full sm:max-w-lg md:max-w-5xl lg:max-w-340 mx-auto md:pb-12 md:pt-16 px-4 pb-8 pt-10 lg:px-8 relative overflow-hidden"
			>
				<section
					className="relative flex flex-wrap md:flex-nowrap justify-between items-center md:items-stretch gap-6 pb-8 md:pb-12 md:grid-cols-2 md:gap-16"
					aria-labelledby={heroHeadingId}
				>
					<motion.div
						className="flex flex-col gap-2"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						<Badge
							variant={"tinted"}
							className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
						>
							<span
								className="inline-flex h-2 w-2 rounded-full bg-primary"
								aria-hidden
							/>
							Prefeitura da Estância Turística de Itu • NAPE
						</Badge>

						<h1
							id={heroHeadingId}
							className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
						>
							Projeto LUPAH
						</h1>

						<p className="text-lg mb-1 leading-relaxed text-muted-foreground sm:text-lg">
							Lúdico Universo da Pessoa com Altas Habilidades. Um programa de
							orientação para crianças com altas habilidades em suas
							dificuldades sociais, emocionais e acadêmicas, em Itu, SP.
						</p>

						<div className="text-md text-foreground">
							Plataforma para a padronização da comunicação de orientações do(a)
							orientador(a) aos pais.
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
							<Badge size={"lg"} className="inline-flex items-center gap-2">
								<Shield className="size-4 text-primary" aria-hidden /> Acesso
								seguro
							</Badge>
							<Badge size={"lg"} className="inline-flex items-center gap-2">
								<Users className="size-4 text-primary" aria-hidden />{" "}
								Orientações aos pais
							</Badge>
							<Badge size={"lg"} className="inline-flex items-center gap-2">
								<CheckCircle2 className="size-4 text-primary" aria-hidden />{" "}
								Comunicação padronizada
							</Badge>
						</div>
					</motion.div>

					<motion.div
						className="relative"
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
					>
						<Card className="p-0 max-w-sm w-full shadow-none border-none">
							<MagicCard gradientSize={375} className="p-0 w-fit">
								<CardHeader className="p-4 border-b border-border w-full">
									<CardTitle className="text-xl">
										<span className="inline-flex items-center gap-2">
											<Lock className="size-5" aria-hidden />
											Acesso do Estudante
										</span>
									</CardTitle>
									<CardDescription>
										Insira o código de acesso de 8 caracteres enviado pela
										coordenação.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-4 grow w-full">
									<form
										id={formId}
										onSubmit={(e) => {
											e.preventDefault();
											e.stopPropagation();
											form.handleSubmit();
										}}
										aria-describedby={`${formId}-hint`}
										aria-label="Formulário de acesso do estudante"
									>
										<form.Field
											name="code"
											validators={{
												onChange: validators.code,
											}}
										>
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={otpId}>Código de Acesso</Label>
													<InputOTP
														id={otpId}
														maxLength={codeLength}
														value={field.state.value ?? ""}
														onChange={(val) => field.handleChange(val ?? "")}
														onBlur={field.handleBlur}
														pattern="[A-Za-z0-9]*"
														containerClassName="justify-start"
														aria-required="true"
														autoFocus
													>
														<InputOTPGroup className="gap-0.5">
															{Array.from(
																{ length: codeLength / 2 },
																(_, i) => (
																	<InputOTPSlot
																		key={`first-${i}`}
																		index={i}
																		aria-label={`Dígito ${i + 1}`}
																	/>
																),
															)}
														</InputOTPGroup>
														<InputOTPSeparator
															className="mx-0 sm:mx-1 md:mx-2 text-muted-foreground"
															aria-hidden
														/>
														<InputOTPGroup className="gap-0.5">
															{Array.from(
																{ length: codeLength / 2 },
																(_, i) => (
																	<InputOTPSlot
																		key={`second-${i + codeLength / 2}`}
																		index={i + codeLength / 2}
																		aria-label={`Dígito ${i + 1 + codeLength / 2}`}
																	/>
																),
															)}
														</InputOTPGroup>
													</InputOTP>
													{field.state.meta.isTouched &&
														field.state.meta.errors.length > 0 && (
															<p className="text-sm font-medium text-destructive">
																{field.state.meta.errors[0]?.message}
															</p>
														)}
													{errorMessage && (
														<p className="text-sm font-medium text-destructive">
															{errorMessage}
														</p>
													)}
												</div>
											)}
										</form.Field>
									</form>
								</CardContent>
								<CardFooter className="p-4 flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-border">
									<p
										id={`${formId}-hint`}
										className="text-muted-foreground text-xs flex-1"
									>
										Seus dados são protegidos. Ao acessar, você concorda em
										manter o sigilo das informações.
									</p>
									<form.Subscribe
										selector={(state) => [state.canSubmit, state.isSubmitting]}
									>
										{([canSubmit, isSubmitting]) => (
											<Button
												type="submit"
												form={formId}
												className="w-full sm:w-auto"
												disabled={!canSubmit || isSubmitting}
												aria-disabled={isSubmitting}
											>
												{isSubmitting ? "Acessando..." : "Acessar"}
											</Button>
										)}
									</form.Subscribe>
								</CardFooter>
							</MagicCard>
						</Card>
					</motion.div>
				</section>

				<section aria-labelledby={intelligencesHeadingId}>
					<div className="flex items-end justify-between">
						<div>
							<h2
								id={intelligencesHeadingId}
								className="text-2xl font-semibold tracking-tight"
							>
								Tipos de Inteligência
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								Diferentes perfis cognitivos e habilidades que podem orientar
								intervenções e trilhas pedagógicas.
							</p>
						</div>
					</div>

					<div className="mt-6">
						<BentoGrid className="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto h-max sm:h-256">
							{intelligenceTypes.map((item) => (
								<BentoCard
									key={item.name}
									name={item.name}
									description={item.description}
									Icon={item.Icon}
									className={item.className}
									href={item.href}
									cta={item.cta}
									background={<div className="absolute inset-0 -z-10" />}
								/>
							))}
						</BentoGrid>
					</div>
				</section>
			</main>
		</div>
	);
}
