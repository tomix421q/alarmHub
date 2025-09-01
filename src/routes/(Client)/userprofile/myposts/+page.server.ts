import prismaClient from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import { deleteNoteById, getUserServer } from '$lib/utils/serverHelp';
import { fail, type Actions } from '@sveltejs/kit';

export const load = (async (event) => {
	const user = await getUserServer({ request: event.request });

	const myPosts = await prismaClient.note.findMany({
		where: { userId: user?.id },
		take: 30,
		orderBy: { createdAt: 'desc' },
		include: {
			images: { select: { url: true } },
			likes: { select: { userId: true } },
			_count: { select: { likes: true } },
			machinesOfNote: { select: { machine: true } }
		}
	});
	return {
		myposts: myPosts
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	deleteMyNote: async (event) => {
		let user = await getUserServer({ request: event.request });
		if (!user?.email) return fail(401, { error: 'Not authenticated', success: false });

		const formData = await event.request.formData();
		const noteIdString = formData.get('noteId');

		if (!noteIdString || typeof noteIdString !== 'string') {
			return fail(400, { error: 'Lost note id try again.', success: false });
		}
		const noteId = parseInt(noteIdString);

		return deleteNoteById(noteId, user?.email);
	}
};
