import { z } from 'zod';

export const addNoteSchema = z.object({
	machineName: z.string(),
	alertId: z.number().min(1, 'Please fill id of alert.'),
	text: z.string().min(10, 'Minimum characters is 10 letters.').max(255, 'Maximum letters is 255.'),
	userId: z.string()
});
