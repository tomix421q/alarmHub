import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserServer } from '$lib/utils/serverHelp';
import prismaClient from '$lib/server/prisma';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	changename: async (event) => {
		let user = await getUserServer({ request: event.request });

		if (!user?.id) {
			return fail(401, { success: false, error: 'Authentication required. Please log in.' });
		}

		const formData = await event.request.formData();
		const newName = formData.get('changeName');

		if (!newName || typeof newName !== 'string' || newName.trim().length < 3) {
			return fail(400, {
				success: false,
				error: 'Invalid name. Name must be at least 3 characters long.'
			});
		}
      
		try {
			await prismaClient.user.update({
				where: { id: user.id },
				data: { name: newName.trim() }
			});
			return { success: true, message: 'Name updated successfully!' };
		} catch (error) {
			console.error('Error changing name:', error);
			return fail(500, { success: false, error: 'Failed to update name.' });
		}
	}
};
