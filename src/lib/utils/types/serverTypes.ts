export type messageAlertType = {
	id: string;
	msg: string;
	timeStamp: Date;
};

export type ProdDataType = {
	actDowntime: number | null;
	prodCurrentNum: number | null;
	toolNumber: number | null;
	toolName: string;
	timeStamp?: Date | null;
};

export type statusType = {
	name: string;
	url: string;
	isConnected: boolean;
	manualShutdown: boolean;
	WSserverInfo: string;
	WSserverError: string;
	lastUpdate: Date;
};

export type morningShift_count = {
	time_06: number;
	time_07: number;
	time_08: number;
	time_09: number;
	time_10: number;
	time_11: number;
	time_12: number;
	time_13: number;
	morningShift_count?: number;
	date: Date,
	finish: boolean;
};
export type afternoonShift_count = {
	time_14: number;
	time_15: number;
	time_16: number;
	time_17: number;
	time_18: number;
	time_19: number;
	time_20: number;
	time_21: number;
	afternoonShift_count?: number;
	date: Date;
	finish: boolean;
};
export type nightShift_count = {
	time_22: number;
	time_23: number;
	time_00: number;
	time_01: number;
	time_02: number;
	time_03: number;
	time_04: number;
	time_05: number;
	nightShift_count?: number;
	date: Date;
	finish: boolean;
};
