import { noteEditData } from './../stores/filter';
import { readFileSync } from 'fs';
import { unlink, writeFile } from 'node:fs/promises';
import path, { extname, resolve } from 'path';
import prisma from '$lib/server/prisma';
import type { ErrorResponse, MachineDbType, SuccessResponse } from './types/machineTypes';
import { addNoteSchema, EditNoteType } from './zod/zodclient';
import { fail } from '@sveltejs/kit';
import prismaClient from '$lib/server/prisma';
import type { Note, Prisma } from '@prisma/client';
import { auth } from '$lib/auth/auth';
import { nanoid } from 'nanoid';
import { env } from 'node:process';

const UPLOAD_DIR = env.UPLOAD_PHOTO_NOTE_ABSOLUTE ?? '';

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
			include: { user: true, images: true },
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

export async function getUserServer({ request }: { request: Request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	return session?.user ?? null;
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
			values: {
				...formData,
				noteImages: undefined
			}
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
			values: {
				...formData,
				noteImages: undefined // alebo vynechaj úplne
			}
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

	// images proccesing_____ IS IMAGE????
	const noteImages = parseZod.data?.noteImages;
	if (noteImages && noteImages.length > 0) {
		const imageRecords = [];
		for (const imageFile of noteImages) {
			try {
				const fileExtension = extname(imageFile.name);
				const uniqueFilename = `${nanoid()}${fileExtension}`;
				// path to save the image
				const imagePath = resolve(UPLOAD_DIR, uniqueFilename);
				const buffer = Buffer.from(await imageFile.arrayBuffer());
				await writeFile(imagePath, buffer);
				// public URL for frontend
				const url = `/uploads/${uniqueFilename}`;
				imageRecords.push({ url, noteId: newNote.id });
			} catch (error) {
				console.error('Error saving one of the images:', error);
				return fail(500, {
					success: false,
					error: 'Failed to save one of the uploaded images.',
					isFormError: true
				} as ErrorResponse);
			}
		}
		if (imageRecords.length > 0) {
			await prismaClient.noteImage.createMany({ data: imageRecords });
		}
	}

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
	const noteId = Number(formDataRaw.noteId);
	const imagesToDelete: number[] = formDataRaw.imagesToDelete
		? (formDataRaw.imagesToDelete as string[]).map(Number)
		: [];
	const newImages = formDataRaw.noteImages as File[];

	if (isNaN(noteId)) {
		return fail(400, { success: false, error: 'Invalid Note ID.' });
	}

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

	//find machine db
	const findNote = await prismaClient.note.findUnique({
		where: { id: parseZod.data.id }
	});
	//update note db
	try {
		const updatedNote = await prismaClient.$transaction(async (prisma) => {
			//update note
			const note = await prisma.note.update({
				where: { id: noteId },
				data: {
					alertDescription: formDataRaw.text as string
				}
			});

			// process images to delete
			if (imagesToDelete.length > 0) {
				const images = await prisma.noteImage.findMany({
					where: { id: { in: imagesToDelete }, noteId: noteId }
				});

				// delete images from disk
				for (const image of images) {
					const filename = image.url.split('/').pop();
					if (filename) {
						try {
							const imagePath = resolve(UPLOAD_DIR, filename);
							await unlink(imagePath);
						} catch (e) {
							console.error(`Failed to delete file: ${filename}`, e);
						}
					}
				}

				// delete images from db
				await prisma.noteImage.deleteMany({
					where: { id: { in: imagesToDelete }, noteId: noteId }
				});
			}

			// add new notes
			if (newImages && newImages.length > 0) {
				const imageRecords = [];
				for (const imageFile of newImages) {
					const fileExtension = extname(imageFile.name);
					const uniqueFilename = `${nanoid()}${fileExtension}`;
					const imagePath = resolve(UPLOAD_DIR, uniqueFilename);
					const buffer = Buffer.from(await imageFile.arrayBuffer());
					await writeFile(imagePath, buffer);
					const url = `/uploads/${uniqueFilename}`;
					imageRecords.push({ url, noteId: note.id });
				}
				if (imageRecords.length > 0) {
					await prisma.noteImage.createMany({ data: imageRecords });
				}
			}

			return note;
		});

		return {
			success: true,
			message: 'Note updated successfully.',
			data: updatedNote
		};
	} catch (error) {
		console.error('Error updating note:', error);
		return fail(500, { success: false, error: 'Failed to update note.' });
	}
}

export async function deleteNoteById(
	noteId: number,
	userEmail: string
): Promise<SuccessResponse<{ deletedNoteId: number }> | ReturnType<typeof fail>> {
	try {
		const noteToDelete = await prismaClient.note.findUnique({
			where: { id: noteId },
			include: {
				user: { select: { email: true } },
				images: true
			}
		});

		if (!noteToDelete) {
			return fail(404, { success: false, error: 'Note not found.' });
		}

		if (noteToDelete.user.email !== userEmail) {
			return fail(403, { success: false, error: 'Not authorized.' });
		}

		if (noteToDelete.images.length > 0) {
			for (const image of noteToDelete.images) {
				console.log(image.url);
				const filename = image.url.split('/').pop();
				if (filename) {
					try {
						const imagePath = resolve(UPLOAD_DIR, filename);
						await unlink(imagePath);
					} catch (e: any) {
						if (e.code !== 'ENOENT') {
							return fail(404, { success: false, error: 'Image notfound on disk' });
						}
					}
				}
			}
		}

		await prismaClient.note.delete({
			where: { id: noteId }
		});

		return {
			success: true,
			message: 'Note and associated images were successfully deleted.',
			data: { deletedNoteId: noteId }
		};
	} catch (error: any) {
		console.error('Server error while deleting note:', error);
		return fail(500, {
			success: false,
			error: `A server error occurred: ${error.message || 'Unknown error'}`
		});
	}
}
