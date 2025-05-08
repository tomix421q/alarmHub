export type SuccessResponse<T = void> = {
	success: true;
	message: string;
	page?: number;
	limit?: number;
	totalPages?: number;
	totalItems?: number;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
	success: false;
	error: string;
	isFormError?: boolean;
	fieldErrors?: Record<string | number, string>;
	values?: Record<string, unknown>;
};

export type Note = {
	id: number;
	createdAt: Date;
	alertId: number;
	alertDescription: string;
	machineId: string;
	updateAt: Date;
	userId: string;
	user: User;
};

export type MachineDbType = {
	name: string;
	id: string;
	updateAt: Date;
	notes: Note[];
};

export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: Date;
};
