import { z } from 'zod';
const machineSchema = z.object({
	name: z.string()
});
const machineConfigSchema = z.record(machineSchema);

export const machinesConfigConst = {
	eqc8: {
		name: 'EqcMF_8',
		url: 'ws://10.184.145.54:1880/ws/test'
	}
};

machineConfigSchema.parse(machinesConfigConst);

//MACHINE FILTER ERRORS [NO DB WRITE]
export const MACHINEFILTERERRORS = [
	'WebSocket connection closed unexpectedly',
	'ENDTIMEOUT connect ETIMEDOUT 10.184.145.54:1880',
	'connect ETIMEDOUT 10.184.145.54:1880'
];
