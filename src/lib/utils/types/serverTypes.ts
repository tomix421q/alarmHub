export type messageAlertType = {
	id: string;
	msg: string;
	timeStamp: Date;
};

export type statusType = {
	name: string;
	url: string;
	isConnected: boolean;
	manualShutdown: boolean;
	WSserverInfo: string;
	WSserverError: string;
};
