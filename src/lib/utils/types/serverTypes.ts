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
