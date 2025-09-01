import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createNote,
	deleteNoteById,
	editNote,
	getMachineNotesResponse,
	getUserServer,
	loadAlertsCsvByName,
	toggleLikeNote
} from '$lib/utils/serverHelp';

type machineAlertsListMap = Map<number, string>;

export const load: PageServerLoad = async ({ params, url, request }) => {
	const MACHINENAME = params.name;
	const machineAlertsListMap: machineAlertsListMap = loadAlertsCsvByName(MACHINENAME);
	const page = Number(url.searchParams.get('page') ?? '1');
	const rawSelectedMachines = url.searchParams.get('selectedMachines');
	const limit = 1000;

	const filters = {
		noteId: url.searchParams.get('noteId') ? Number(url.searchParams.get('noteId')) : undefined,
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
		const sessionUser = await getUserServer({ request: event.request });

		if (!sessionUser?.id) {
			return fail(401, { success: false, error: 'Authentication required. Please log in.' });
		}
		// const formDataRaw = Object.fromEntries(await event.request.formData());
		const machineAlertsListMap = loadAlertsCsvByName(event.params.name!);
		const formData = await event.request.formData();
		const Allimages = formData.getAll('noteImages') as File[];
		const validImages = Allimages.filter((file) => file.size > 0);

		const formDataRaw = {
			alertCategory: formData.get('alertCategory'),
			noteId: formData.get('noteId'),
			machineIds: formData.get('machineIds'),
			alertId: formData.get('alertId'),
			text: formData.get('text'),
			userId: sessionUser.id,
			noteImages: validImages
		};

		if (formDataRaw.noteId) {
			const imagesToDelete = formData.getAll('imagesToDelete');
			const fullFormData = { ...formDataRaw, imagesToDelete };
			const editData = await editNote(fullFormData);
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
	},
	toggleLike: async ({ request }) => {
		const checkUser = await getUserServer({ request });
		if (!checkUser?.id) {
			return fail(401, { success: false, error: 'Not authenticated.' });
		}
		const formData = await request.formData();
		const noteId = Number(formData.get('noteId'));
		const userId = formData.get('userId') as string;

		return toggleLikeNote(noteId, userId, checkUser.id);
	}
};
