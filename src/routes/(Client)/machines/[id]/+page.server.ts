import {
	type ErrorResponse,
	type MachineDbType,
	type SuccessResponse
} from './../../../../lib/utils/types/machineTypes';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import prismaClient from '$lib/server/prisma';
import { addNoteSchema } from '$lib/utils/zod/zodclient';
import { goto } from '$app/navigation';

let MACHINENAME: string;

export const load: PageServerLoad = async ({ params }) => {
	MACHINENAME = params.id;
	if (!MACHINENAME) goto('/');

	let dbdata: ErrorResponse | SuccessResponse<MachineDbType>;

	const findMachine = await prismaClient.machines.findUnique({
		where: { name: MACHINENAME },
		include: {
			notes: {
				orderBy: {
					updateAt: 'desc'
				},
				include: {
					user: true
				}
			}
		}
	});
	if (!findMachine) {
		dbdata = {
			success: false,
			error: 'Machine in db not found...'
		};
	} else {
		dbdata = {
			success: true,
			message: `Data from db machine ${MACHINENAME}`,
			data: findMachine
		};
	}
	// console.log(dbdata);
	return { dbdata, MACHINENAME };
};

export const actions: Actions = {
	addnote: async (request) => {
		const formDataRaw = Object.fromEntries(await request.request.formData());
		const formData = {
			...formDataRaw,
			alertId: formDataRaw.alertId ? Number(formDataRaw.alertId) : undefined
		};
		const parseZod = addNoteSchema.safeParse(formData);

		if (!parseZod.success) {
			const fieldErrors = parseZod.error.errors.reduce(
				(acc, e) => {
					acc[e.path[0]] = e.message;
					return acc;
				},
				{} as Record<string | number, string>
			);

			const errorReponse: ErrorResponse = {
				success: false,
				error: 'Validation failed',
				isFormError: true,
				fieldErrors,
				values: formData
			};
			return fail(400, errorReponse);
		}

		const nameMachineInDb = await prismaClient.machines.findUnique({
			where: { name: parseZod.data.machineName }
		});
		if (nameMachineInDb) {
			await prismaClient.note.create({
				data: {
					machineId: nameMachineInDb.id,
					alertId: parseZod.data.alertId,
					alertDescription: parseZod.data.text,
					userId: parseZod.data.userId
				}
			});
		}

		const successResponse: SuccessResponse = {
			success: true,
			message: 'Note added successfully'
		};
		return successResponse;
	}
};
