import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createNote,
	deleteNoteById,
	editNote,
	getMachineNotesResponse,
	getUserServer,
	loadAlertsCsvByName
} from '$lib/utils/serverHelp';

let MACHINENAME: string;
let machineAlertsListMap: Map<number, string>;

export const load: PageServerLoad = async ({ params, url }) => {
	MACHINENAME = params.name;
	machineAlertsListMap = loadAlertsCsvByName(MACHINENAME);
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 1000;

	const filters = {
		alertId: url.searchParams.get('alertId') ? Number(url.searchParams.get('alertId')) : undefined,
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

		if (formDataRaw.noteId) {
			const editData = await editNote(formDataRaw);
			return editData;
		} else {
			const noteData = await createNote(formDataRaw, machineAlertsListMap);
			return noteData;
		}
	},
	deletenote: async ({ request }) => {
		let user = await getUserServer({ request });
		if (!user?.email) return fail(401, { error: 'Not authenticated', success: false });

		const formData = await request.formData();
		const noteIdString = formData.get('noteId');

		if (!noteIdString || typeof noteIdString !== 'string') {
			return fail(400, { errro: 'Lost note id try again.', success: false });
		}
		const noteId = parseInt(noteIdString);

		return deleteNoteById(noteId, user?.email);
	}
};
