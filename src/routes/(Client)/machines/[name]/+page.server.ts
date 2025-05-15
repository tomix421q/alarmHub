import { type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createNote, getMachineNotesResponse, loadAlertsCsvByName } from '$lib/utils/serverHelp';

let MACHINENAME: string;
let machineAlertsListMap: Map<number, string>;

export const load: PageServerLoad = async ({ params, url }) => {
	MACHINENAME = params.name;
	machineAlertsListMap = loadAlertsCsvByName(MACHINENAME);
	let alertIdRaw = url.searchParams.get('alertId');
	const alertId = alertIdRaw !== null && alertIdRaw !== '' ? Number(alertIdRaw) : undefined;
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 1000;

	const filters = {
		alertId: alertId,
		user: url.searchParams.get('user') ?? undefined,
		desc: url.searchParams.get('desc') ?? undefined,
		from: url.searchParams.get('from') ?? undefined,
		to: url.searchParams.get('to') ?? undefined
	};
	const dbdata = await getMachineNotesResponse({
		machineName: MACHINENAME,
		filters,
		page,
		limit
	});

	return { dbdata, MACHINENAME, machineAlertsListMap };
};

export const actions: Actions = {
	addnote: async (event) => {
		const formDataRaw = Object.fromEntries(await event.request.formData());

		const noteData = await createNote(formDataRaw, machineAlertsListMap);
		return { ...noteData };
	}
};
