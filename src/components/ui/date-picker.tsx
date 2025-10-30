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

	return format(date, "dd/MM/yyyy", { locale: ptBR });
}

function isValidDate(date: Date | undefined) {
	if (!date) {
		return false;
	}
	return !Number.isNaN(date.getTime());
}

/**
 * Format the raw user input into slashes inserted progressively without letter placeholders.
 *
 * Behavior:
 * - 0 digits -> ""
 * - 1 digit  -> "d" (just the digit)
 * - 2 digits -> "dd/" (day complete, add trailing slash)
 * - 3 digits -> "dd/M" (month partial)
 * - 4 digits -> "dd/MM/" (month complete, add trailing slash for year)
 * - 5-7 digits -> "dd/MM/yyy..." (partial year, no placeholders)
 * - >=8 digits -> "dd/MM/yyyy" (use first 8 digits)
 */
function formatInputParts(raw: string) {
	const digits = (raw || "").replace(/\D/g, "");
	if (digits.length === 0) return "";
	if (digits.length === 1) {
		// single digit day
		return digits;
	}
	if (digits.length === 2) {
		// full day -> show trailing slash to indicate month
		return `${digits.slice(0, 2)}/`;
	}
	if (digits.length > 2 && digits.length < 4) {
		// day + partial month (no trailing slash)
		const day = digits.slice(0, 2);
		const monthPart = digits.slice(2);
		return `${day}/${monthPart}`;
	}
	if (digits.length === 4) {
		// day + full month -> add trailing slash for year
		return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/`;
	}
	if (digits.length > 4 && digits.length < 8) {
		// partial year (no placeholders)
		const day = digits.slice(0, 2);
		const month = digits.slice(2, 4);
		const yearPart = digits.slice(4);
		return `${day}/${month}/${yearPart}`;
	}
	// 8 or more digits -> full date using first 8 digits
	const day = digits.slice(0, 2);
	const month = digits.slice(2, 4);
	const year = digits.slice(4, 8);
	return `${day}/${month}/${year}`;
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
		<div className={cn("flex flex-col gap-2 w-fit", className)}>
			<Label htmlFor={id} className="px-1 w-max">
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
						const raw = e.target.value;
						// Update visible input with partial formatting (placeholders)
						const formatted = formatInputParts(raw);
						setInputValue(formatted);

						// Only emit a full date once we have at least 8 digits (ddMMyyyy)
						const digits = raw.replace(/\D/g, "");
						if (digits.length >= 8) {
							const day = Number(digits.slice(0, 2));
							const month = Number(digits.slice(2, 4));
							const year = Number(digits.slice(4, 8));

							const parsedDate = new Date(year, month - 1, day);

							// Validate constructed date (and guard against things like 31 Feb)
							if (
								isValidDate(parsedDate) &&
								parsedDate.getFullYear() === year &&
								parsedDate.getMonth() === month - 1 &&
								parsedDate.getDate() === day
							) {
								onChange?.(parsedDate);
								setMonth(parsedDate);
								// normalize display to formatted full date
								setInputValue(formatDate(parsedDate));
							}
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
