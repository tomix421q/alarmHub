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
		title: 'Eqc-MF 8',
		shortname: 'MF8',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc8.name}`
	},
	{
		icon: MailCheckIcon,
		title: 'Eqc-MF 7',
		shortname: 'MF7',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc7.name}`
	}
];
