"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "./data-table-column-header";

export type StudentRow = {
	_id: string;
	name: string;
	grade: string;
	status: "active" | "inactive" | "graduated";
	documentCount: number;
	reportsCount: number;
	activitiesCount: number;
};

function getStatusBadge(status: string) {
	switch (status) {
		case "active":
			return (
				<Badge variant="default" className="gap-1">
					Ativo
				</Badge>
			);
		case "inactive":
			return (
				<Badge variant="secondary" className="gap-1">
					Inativo
				</Badge>
			);
		case "graduated":
			return (
				<Badge variant="outline" className="gap-1">
					Formado
				</Badge>
			);
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
}

export const studentsColumns: ColumnDef<StudentRow>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nome" />
		),
		cell: ({ row }) => {
			return <span className="font-medium">{row.getValue("name")}</span>;
		},
	},
	{
		accessorKey: "grade",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Série" />
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			return getStatusBadge(row.getValue("status"));
		},
	},
	{
		accessorKey: "documentCount",
		header: ({ column }) => (
			<div className="text-center">
				<DataTableColumnHeader column={column} title="Docs" />
			</div>
		),
		cell: ({ row }) => {
			return (
				<div>
					<Badge variant="outline">{row.getValue("documentCount")}</Badge>
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const student = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0 float-right">
							<span className="sr-only">Abrir menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Ações</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => {
								window.location.href = `/admin/${student._id}`;
							}}
						>
							Editar aluno
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(student._id);
							}}
						>
							Copiar ID
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
