import { getUserServer } from '$lib/utils/serverHelp';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prismaClient from '$lib/server/prisma';

export const load: LayoutServerLoad = async (event) => {
	const user = await getUserServer({ request: event.request });
	if (user === null) redirect(302, '/');

	const [addedNotesCount, likedNotesCount] = await Promise.all([
		prismaClient.note.count({
			where: { userId: user.id }
		}),
		prismaClient.noteLike.count({
			where: { userId: user.id }
		})
	]);

	return {
		userprofile: {
			stats: {
				noteAdded: addedNotesCount,
				noteLiked: likedNotesCount
			}
		}
	};
};
