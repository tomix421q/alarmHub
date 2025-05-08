import { writable } from 'svelte/store';

export type HmiNoteFilters = {
	alertId: string;
	user: string;
	desc: string;
	from: string;
	to: string;
};

export const hmiNoteFilters = writable<HmiNoteFilters>({
	alertId: '',
	user: '',
	desc: '',
	from: '',
	to: ''
});
