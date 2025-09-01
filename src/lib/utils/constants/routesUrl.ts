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
		title: 'Eqc-MF 1',
		shortname: 'MF1',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc1.name}`
	},
	{
		icon: BrainCircuit,
		title: 'Eqc-MF 2',
		shortname: 'MF2',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc2.name}`
	},
	{
		icon: BrainCircuit,
		title: 'Eqc-MF 3',
		shortname: 'MF3',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc3.name}`
	},
	{
		icon: BrainCircuit,
		title: 'Eqc-MF 4',
		shortname: 'MF4',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc4.name}`
	},
	{
		icon: MailCheckIcon,
		title: 'Eqc-MF 5',
		shortname: 'MF5',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc5.name}`
	},
	{
		icon: MailCheckIcon,
		title: 'Eqc-MF 6',
		shortname: 'MF6',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc6.name}`
	},
	{
		icon: MailCheckIcon,
		title: 'Eqc-MF 7',
		shortname: 'MF7',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc7.name}`
	},
	{
		icon: BrainCircuit,
		title: 'Eqc-MF 8',
		shortname: 'MF8',
		url: `/machines/eqc-mf/${machinesConfigConst.eqc8.name}`
	}
];
