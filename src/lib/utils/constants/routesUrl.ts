import { BrainCircuit } from '@lucide/svelte';
import House from '@lucide/svelte/icons/house';
import { machinesConfigConst } from './constants';
import { MailCheckIcon } from 'lucide-svelte';

export const urlsConst = [
	{
		icon: House,
		title: 'Home',
		shortname: 'H',
		url: '/'
	},
	{
		icon: BrainCircuit,
		title: 'Eqc 8',
		shortname: 'MF8',
		url: `/machines/${machinesConfigConst.eqc8.name}`
	},
	{
		icon: MailCheckIcon,
		title: 'Eqc 7',
		shortname: 'MF7',
		url: `/machines/${machinesConfigConst.eqc7.name}`
	}
];
