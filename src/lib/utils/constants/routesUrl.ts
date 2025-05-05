import { BrainCircuit } from '@lucide/svelte';
import House from '@lucide/svelte/icons/house';
import { machinesConfigConst } from './constants';

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
	}
];
