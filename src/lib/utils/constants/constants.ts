import { z } from 'zod';
const machineSchema = z.object({
	name: z.string()
});
const machineConfigSchema = z.record(machineSchema);

export const machinesConfigConst = {
	eqc8: {
		name: 'EqcMF_8',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc8',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc8'
	},
	eqc7: {
		name: 'EqcMF_7',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc7',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc7'
	},
	eqc6: {
		name: 'EqcMF_6',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc6',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc6'
	},
	eqc5: {
		name: 'EqcMF_5',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc5',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc5'
	},
	eqc4: {
		name: 'EqcMF_4',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc4',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc4'
	},
	eqc3: {
		name: 'EqcMF_3',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc3',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc3'
	},
	eqc2: {
		name: 'EqcMF_2',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc2',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc2'
	},
	eqc1: {
		name: 'EqcMF_1',
		url_alert: 'ws://10.184.145.54:1880/wsnr/alerts/eqc1',
		url_data: 'ws://10.184.145.54:1880/wsnr/proddata/eqc1'
	}
};

machineConfigSchema.parse(machinesConfigConst);

//MACHINE FILTER ERRORS [NO DB WRITE]
export const MACHINEFILTERERRORS = [
	'WebSocket connection closed unexpectedly',
	'ENDTIMEOUT connect ETIMEDOUT 10.184.145.54:1880',
	'connect ETIMEDOUT 10.184.145.54:1880'
];

export const userProfileUrlsConst = [
	{ title: 'Home', url: '/userprofile' },
	{ title: 'Account', url: '/userprofile/account' },
	{ title: 'My Posts', url: '/userprofile/myposts' },
	{ title: 'Favorite', url: '/userprofile/favorite' }
];
