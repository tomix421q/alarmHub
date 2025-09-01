import { readFileSync } from 'fs';
import { unlink, writeFile } from 'node:fs/promises';
import path, { extname, resolve } from 'path';
import type { ErrorResponse, MachineDbType, SuccessResponse } from './types/machineTypes';
import { addNoteSchema, EditNoteType } from './zod/zodclient';
import { fail } from '@sveltejs/kit';
import prismaClient from '$lib/server/prisma';
import type { Note, Prisma } from '@prisma/client';
import { auth } from '$lib/auth/auth';
import { nanoid } from 'nanoid';

let UPLOAD_DIR = process.env.UPLOAD_PHOTO_NOTE_ABSOLUTE as string;

export function loadAlertsCsvByName(machineName: string): Map<number, string> {
	if (
		machineName === 'EqcMF_7' ||
		machineName === 'EqcMF_6' ||
		machineName === 'EqcMF_5' ||
		machineName === 'EqcMF_8'
	)
		machineName = 'EqcMF_8765';
	if (
		machineName === 'EqcMF_1' ||
		machineName === 'EqcMF_2' ||
		machineName === 'EqcMF_3' ||
		machineName === 'EqcMF_4'
	) {
		machineName = 'EqcMF_4321';
	}
	let csvText: string;
	const map = new Map<number, string>();
	try {
		const csvFilePath = path.resolve(`static/csv/alertsLists/${machineName}.csv`);
		csvText = readFileSync(csvFilePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			console.log(`CSV file for machine: "${machineName}" not found.`);
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
		noteId?: number;
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
	let targetMachineIds: string[] = [machine.id];

	const where: Prisma.NoteWhereInput = {
		machinesOfNote: { some: { machineId: { in: targetMachineIds } } }
	};
	if (typeof filters.noteId === 'number') {
		where.id = filters.noteId;
	}
	if (typeof filters.alertId === 'number') {
		where.alertId = filters.alertId;
	}
	if (filters.user) where.user = { name: { contains: filters.user } };
	if (filters.desc) where.alertCategory = { contains: filters.desc };
	if (filters.from || filters.to) {
		where.createdAt = {};
		if (filters.from) where.createdAt.gte = new Date(filters.from);
		if (filters.to) where.createdAt.lte = new Date(filters.to);
	}

	const [notes, count] = await Promise.all([
		await prismaClient.note.findMany({
			where,
			include: {
				user: true,
				images: true,
				likes: { select: { userId: true } },
				machinesOfNote: {
					include: { machine: { select: { id: true, name: true } } }
				}
			},
			orderBy: { updateAt: 'desc' },
			take: limit,
			skip: (page - 1) * limit
		}),
		prismaClient.note.count({ where })
	]);
	const totalPages = Math.ceil(count / limit);

	const otherMachineIdsGroup = await prismaClient.machines.findMany({
		where: {
			name: {
				startsWith: 'EqcMF_'
			}
		},
		select: { id: true, name: true }
	});
	return {
		success: true,
		message: `Data from db machine ${machineName}`,
		data: { ...machine, notes, otherMachineIdsGroup },
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
	const rawMachineIds = formDataRaw.machineIds as string;
	const selectedMachineIds = rawMachineIds ? rawMachineIds.split(',').map((id) => id.trim()) : [];

	try {
		const newNote = await prismaClient.$transaction(async (prisma) => {
			const createNote = await prisma.note.create({
				data: {
					alertId: parseZod.data.alertId as number,
					alertCategory: formDataRaw.alertCategory,
					alertDescription: parseZod.data.text,
					userId: parseZod.data.userId
				}
			});

			const machineNoteRecords = selectedMachineIds.map((machineId) => ({
				noteId: createNote.id,
				machineId: machineId
			}));

			await prisma.machineNote.createMany({ data: machineNoteRecords });

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
						const url = `/api/uploads/${uniqueFilename}`;
						imageRecords.push({ url, noteId: createNote.id });
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
					await prisma.noteImage.createMany({ data: imageRecords });
				}
			}
			return createNote;
		});
		return {
			success: true,
			message: 'Note added successfully.',
			data: newNote
		} as SuccessResponse<Note>;
	} catch (error) {
		console.error('Error creating note and linking machines:', error);
		return fail(500, { success: false, error: 'Failed to create note and link machines.' });
	}
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
					const url = `/api/uploads/${uniqueFilename}`;
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
			return fail(404, { success: false, error: `Note ${noteId} not found.` });
		}

		if (noteToDelete.user.email !== userEmail) {
			return fail(403, { success: false, error: 'Not authorized.' });
		}

		if (noteToDelete.images.length > 0) {
			for (const image of noteToDelete.images) {
				// console.log(image.url);
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
			message: `Note ${noteId} was successfully deleted.`,
			data: { deletedNoteId: noteId }
		};
	} catch (error: any) {
		console.error(`Server error while deleting note ${noteId} :`, error);
		return fail(500, {
			success: false,
			error: `A server error occurred: ${error.message || 'Unknown error'}`
		});
	}
}

export async function toggleLikeNote(
	noteId: number,
	userId: string,
	userIdByServer: string
): Promise<{ success: boolean; liked: boolean } | ReturnType<typeof fail>> {
	if (isNaN(noteId)) {
		return fail(400, { success: false, error: 'Invaalid Note ID.' });
	}
	try {
		//check if like exist
		const existingLike = await prismaClient.noteLike.findUnique({
			where: {
				noteId_userId: {
					noteId: noteId,
					userId: userIdByServer
				}
			}
		});
		if (existingLike) {
			//if exist so delete like
			await prismaClient.noteLike.delete({
				where: {
					noteId_userId: {
						noteId: noteId,
						userId: userIdByServer
					}
				}
			});
			return { success: true, liked: false };
		} else {
			//if no exist create like
			await prismaClient.noteLike.create({
				data: {
					noteId: noteId,
					userId: userIdByServer
				}
			});
			return { success: true, liked: true };
		}
	} catch (error) {
		console.log('Error toggling like:', error);
		return fail(500, { success: false, error: 'Failed to update like status.' });
	}
}
