import prismaClient from '$lib/server/prisma';
import { getUserServer } from '$lib/utils/serverHelp';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const user = await getUserServer({ request: event.request });

	const myLikes = await prismaClient.noteLike.findMany({
		where: { userId: user?.id },
		take: 30,
		orderBy: { createdAt: 'desc' },
		include: {
			note: {
				include: {
					images: true,
					machinesOfNote: { select: { machine: true } },
					user: true,
					likes: { select: { userId: true } },
					_count: { select: { likes: true } }
				}
			}
		}
	});
	// console.log(myLikes);
	return {
		favorite: myLikes
	};
}) satisfies PageServerLoad;
