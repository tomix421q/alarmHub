import {
	type ErrorResponse,
	type MachineDbType,
	type SuccessResponse
} from '../../../../lib/utils/types/machineTypes';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import prismaClient from '$lib/server/prisma';
import { addNoteSchema } from '$lib/utils/zod/zodclient';
import { getMachineNotesResponse, loadAlertsCsvByName } from '$lib/utils/serverHelp';

let MACHINENAME: string;
let machineAlertsListMap: Map<number, string>;

export const load: PageServerLoad = async ({ params, url }) => {
	MACHINENAME = params.name;
	machineAlertsListMap = loadAlertsCsvByName(MACHINENAME);
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 10;

	const filters = {
		alertId: url.searchParams.get('alertId') ? Number(url.searchParams.get('alertId')) : undefined,
		user: url.searchParams.get('user') ?? undefined,
		desc: url.searchParams.get('desc') ?? undefined,
		from: url.searchParams.get('from') ?? undefined,
		to: url.searchParams.get('to') ?? undefined
	};

	const dbdata = await getMachineNotesResponse({
		machineName: params.name,
		filters,
		page,
		limit
	});

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

		if (parseZod.data?.alertId && !machineAlertsListMap!.has(parseZod.data.alertId)) {
			return fail(400, {
				success: false,
				error: `Alert ID '${formData.alertId}' not found in alert list.`,
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
