import { z } from 'zod';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILES_COUNT = 10;

const fileSchema = z
	.instanceof(File, { message: 'Please upload a file.' })
	.refine((file) => file.size <= MAX_FILE_SIZE_BYTES, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
	.refine(
		(file) => ALLOWED_IMAGE_TYPES.includes(file.type),
		'Only .png .jpg .jpeg .gif, and .webp formats are supported.'
	);

export const addNoteSchema = z.object({
	machineId: z.string(),
	alertId: z.number().min(0, 'Please fill id of alert.'),
	text: z.string().min(10, 'Minimum characters is 10 letters.').max(255, 'Maximum letters is 255.'),
	userId: z.string(),
	noteImages: z
		.array(fileSchema)
		.max(MAX_FILES_COUNT, `You can upload a maximum of ${MAX_FILES_COUNT} images.`)
		.nullable()
		.optional()
});

export const EditNoteType = z.object({
	id: z.number(),
	machineId: z.string(),
	alertId: z.number().min(0, 'Please fill id of alert.'),
	text: z.string().min(10, 'Minimum characters is 10 letters.').max(255, 'Maximum letters is 255.'),
	userId: z.string(),
	notHmiNote: z.string().optional()
});
