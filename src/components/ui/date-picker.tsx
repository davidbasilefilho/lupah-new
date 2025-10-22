"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithLabelProps {
	id?: string;
	label: string;
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
}

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function isValidDate(date: Date | undefined) {
	if (!date) {
		return false;
	}
	return !Number.isNaN(date.getTime());
}

export function DatePickerWithLabel({
	id,
	label,
	value,
	onChange,
	placeholder = "Selecione a data",
	required = false,
	disabled = false,
	error,
	className,
}: DatePickerWithLabelProps) {
	const [open, setOpen] = React.useState(false);
	const [month, setMonth] = React.useState<Date | undefined>(value);
	const [inputValue, setInputValue] = React.useState(formatDate(value));

	// Update input value when external value changes
	React.useEffect(() => {
		setInputValue(formatDate(value));
		setMonth(value);
	}, [value]);

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label htmlFor={id} className="px-1">
				{label}
				{required && <span className="text-destructive ml-1">*</span>}
			</Label>
			<div className="relative flex gap-2">
				<Input
					id={id}
					value={inputValue}
					placeholder={placeholder}
					className={cn("bg-background pr-10", error && "border-destructive")}
					disabled={disabled}
					onChange={(e) => {
						const newValue = e.target.value;
						setInputValue(newValue);

						// Try to parse the date
						const parsedDate = new Date(newValue);
						if (isValidDate(parsedDate)) {
							onChange?.(parsedDate);
							setMonth(parsedDate);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setOpen(true);
						}
					}}
				/>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							disabled={disabled}
							className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
						>
							<CalendarIcon className="size-3.5" />
							<span className="sr-only">Selecionar data</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto overflow-hidden p-0"
						align="end"
						alignOffset={-8}
						sideOffset={10}
					>
						<Calendar
							mode="single"
							selected={value}
							captionLayout="dropdown"
							month={month}
							onMonthChange={setMonth}
							onSelect={(date) => {
								onChange?.(date);
								setInputValue(formatDate(date));
								setOpen(false);
							}}
							locale={ptBR}
							fromYear={1900}
							toYear={new Date().getFullYear()}
						/>
					</PopoverContent>
				</Popover>
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
