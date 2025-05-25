import { z } from 'zod';

export const addNoteSchema = z.object({
	machineId: z.string(),
	alertId: z.number().min(0, 'Please fill id of alert.'),
	text: z.string().min(10, 'Minimum characters is 10 letters.').max(255, 'Maximum letters is 255.'),
	userId: z.string(),
	notHmiNote: z.string().optional()
});

export const EditNoteType = z.object({
	id: z.number(),
	machineId: z.string(),
	alertId: z.number().min(0, 'Please fill id of alert.'),
	text: z.string().min(10, 'Minimum characters is 10 letters.').max(255, 'Maximum letters is 255.'),
	userId: z.string(),
	notHmiNote: z.string().optional()
});
// .refine(
// 	(data) => {
// 		if (data.isHmiAlert === 'true' || data.isHmiAlert === 'on') {
// 			return data.alertId === 0;
// 		}
// 		return typeof data.alertId === 'number' && data.alertId >= 1;
// 	},
// 	{ message: 'Please fill id of alerttttt.', path: ['alertId'] }
// );
