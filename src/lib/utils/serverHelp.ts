import { readFileSync } from 'fs';
import path, { parse } from 'path';
import prisma from '$lib/server/prisma';
import type { ErrorResponse, MachineDbType, SuccessResponse } from './types/machineTypes';
import { addNoteSchema, EditNoteType } from './zod/zodclient';
import { fail } from '@sveltejs/kit';
import prismaClient from '$lib/server/prisma';
import type { Note, Prisma } from '@prisma/client';
import { auth } from '$lib/auth/auth';

export function loadAlertsCsvByName(machineName: string): Map<number, string> {
	if (machineName === 'EqcMF_7') machineName = 'EqcMF_8';
	let csvText: string;
	const map = new Map<number, string>();
	try {
		const csvFilePath = path.resolve(`src/lib/utils/constants/alertsLists/${machineName}.csv`);
		csvText = readFileSync(csvFilePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			// throw new Error(`CSV súbor pre stroj "${machineName}" nebol nájdený.`);
			console.log(`CSV súbor pre stroj "${machineName}" nebol nájdený.`);
			return map;
		} else {
			throw error;
		}
	}

	for (const line of csvText.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const semicolonIndex = trimmed.indexOf(';');
		if (semicolonIndex === -1) continue;

		// const key = trimmed.slice(0, semicolonIndex).trim();
		const desc = trimmed.slice(semicolonIndex + 1).trim();

		if (!desc) continue;

		const idStr = desc.split('_')[0].trim();
		const idNum = parseInt(idStr, 10);
		if (isNaN(idNum)) {
			console.warn(`Invalid number parsed from idStr '${idStr}' on line: ${trimmed}`);
			continue;
		}
		const description = desc.includes('_') ? desc.split('_').slice(1).join('_').trim() : desc;

		map.set(idNum, description);
	}
	return map;
}

export async function getMachineNotesResponse({
	machineName,
	filters,
	page = 1,
	limit = 10
}: {
	machineName: string;
	filters: {
		alertId?: number;
		user?: string;
		desc?: string;
		from?: string;
		to?: string;
	};
	page?: number;
	limit?: number;
}): Promise<ErrorResponse | SuccessResponse<MachineDbType>> {
	const machine = await prismaClient.machines.findUnique({
		where: { name: machineName }
	});
	if (!machine) {
		const errorResponse: ErrorResponse = {
			success: false,
			error: `Machine in db not found,name : ${machineName}`
		};
		return errorResponse;
	}

	const where: Prisma.NoteWhereInput = { machineId: machine.id };
	if (typeof filters.alertId === 'number') {
		where.alertId = filters.alertId;
	}
	if (filters.user) where.user = { name: { contains: filters.user } };
	if (filters.desc) where.alertDescription = { contains: filters.desc };
	if (filters.from || filters.to) {
		where.createdAt = {};
		if (filters.from) where.createdAt.gte = new Date(filters.from);
		if (filters.to) where.createdAt.lte = new Date(filters.to);
	}

	const [notes, count] = await Promise.all([
		prisma.note.findMany({
			where,
			include: { user: true },
			orderBy: { updateAt: 'desc' },
			take: limit,
			skip: (page - 1) * limit
		}),
		prisma.note.count({ where })
	]);
	const totalPages = Math.ceil(count / limit);

	return {
		success: true,
		message: `Data from db machine ${machineName}`,
		data: { ...machine, notes },
		page,
		limit,
		totalPages,
		totalItems: count
	};
}

export async function createNote(
	formDataRaw: Record<string, any>,
	machineAlertListMap: Map<number, string>
): Promise<SuccessResponse<Note> | ReturnType<typeof fail>> {
	const formData = {
		...formDataRaw,
		alertId: formDataRaw.alertId ? Number(formDataRaw.alertId) : undefined
	};
	const parseZod = addNoteSchema.safeParse(formData);

	if (parseZod.data?.alertId !== undefined && !machineAlertListMap.has(parseZod.data.alertId)) {
		return fail(400, {
			success: false,
			error: `Alert ID ${formData.alertId} not found in alert list.`,
			isFormError: true,
			fieldErrors: {
				alertId: 'Invalid alert ID.'
			},
			values: formData
		} as ErrorResponse);
	}
	if (!parseZod.success) {
		const fieldErrors = parseZod.error.errors.reduce(
			(acc, e) => {
				acc[e.path[0]] = e.message;
				return acc;
			},
			{} as Record<string | number, string>
		);

		return fail(400, {
			success: false,
			error: 'Validation failed',
			isFormError: true,
			fieldErrors,
			values: formData
		} as ErrorResponse);
	}

	const newNote: Note = await prismaClient.note.create({
		data: {
			machineId: parseZod.data.machineId,
			alertId: parseZod.data.alertId as number,
			alertDescription: parseZod.data.text,
			userId: parseZod.data.userId
		}
	});

	return {
		success: true,
		message: 'Note added successfully.',
		data: newNote
	};
}

export async function editNote(
	formDataRaw: Record<string, any>
): Promise<SuccessResponse<Note> | ReturnType<typeof fail>> {
	const formData = {
		...formDataRaw,
		id: Number(formDataRaw.noteId),
		alertId: formDataRaw.alertId ? Number(formDataRaw.alertId) : undefined
	};
	const parseZod = EditNoteType.safeParse(formData);

	if (!parseZod.success) {
		const fieldErrors = parseZod.error.errors.reduce(
			(acc, e) => {
				acc[e.path[0]] = e.message;
				return acc;
			},
			{} as Record<string | number, string>
		);
		return fail(400, {
			success: false,
			error: 'Validation failed',
			isFormError: true,
			fieldErrors,
			values: formData
		} as ErrorResponse);
	}

	const findNote = await prismaClient.note.findUnique({
		where: { id: parseZod.data.id }
	});
	const editNote: Note = await prismaClient.note.update({
		where: {
			id: findNote?.id
		},
		data: {
			alertDescription: parseZod.data.text
		}
	});
	if (!findNote || !editNote) {
		return fail(400, {
			success: false,
			error: `Note with ID ${parseZod.data.id} does not exist.`,
			isFormError: false,
			values: formData
		} as ErrorResponse);
	}

	return {
		success: true,
		message: 'Note updated successfully.',
		data: editNote
	};
}

export async function getUserServer({ request }: { request: Request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	return session?.user ?? null;
}

export async function deleteNoteById(
	noteId: number,
	userEmail: string
): Promise<SuccessResponse<{ deletedNoteId: number }> | ReturnType<typeof fail>> {
	try {
		const noteToDelete = await prismaClient.note.findUnique({
			where: { id: noteId },
			select: { user: true, machine: { select: { name: true } } }
		});

		if (noteToDelete?.user.email !== userEmail) {
			return fail(400, {
				success: false,
				error: 'User error this note didnt asociate with user',
				isFormError: true
			} as ErrorResponse);
		}

		if (!noteToDelete) {
			return fail(404, {
				success: false,
				error: 'Poznámka s daným ID nebola nájdená.',
				isFormError: true
			} as ErrorResponse);
		}

		await prismaClient.note.delete({
			where: { id: noteId }
		});
		return {
			success: true,
			message: 'Note was successfully deleted.',
			data: { deletedNoteId: noteId }
		};
	} catch (error: any) {
		console.error('Serverová chyba pri mazaní poznámky:', error);
		return fail(500, {
			success: false,
			error: `Nastala serverová chyba: ${error.message || 'Neznáma chyba'}`,
			isFormError: true
		} as ErrorResponse);
	}
}
