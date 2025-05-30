import type {
	afternoonShiftCounting,
	morningShiftCounting,
	nightShiftCounting
} from '$lib/server/productionCount/eqc_8';
import type { messageAlertType, ProdDataType, statusType } from '$lib/utils/types/serverTypes';
import { derived, writable } from 'svelte/store';

const MESSAGE_EXPIRY = 5000;

// intern variables
let eventSourceInstance: EventSource | null = null;
let currentMachineName: string | null = null;
let reconnectTimeoutId: number | null = null;

interface ShiftCountData {
	morning: typeof morningShiftCounting;
	afternoon: typeof afternoonShiftCounting;
	night: typeof nightShiftCounting;
	timestamp: string;
}

// WRITABLES
export const isLoading = writable(false);
export const alertMessagesRaw = writable<messageAlertType[]>([]);
export const serverAlertsStatus = writable<statusType | undefined>(undefined);
export const serverProdDataStatus = writable<statusType | undefined>(undefined);
export const currentProductionData = writable<ProdDataType>({
	actDowntime: null,
	prodCurrentNum: null,
	toolNumber: null,
	toolName: 'N/A',
	timeStamp: null
});
export const shiftCountData = writable<ShiftCountData>({
	morning: {
		time_06: 0,
		time_07: 0,
		time_08: 0,
		time_09: 0,
		time_10: 0,
		time_11: 0,
		time_12: 0,
		time_13: 0,
		morningShift_count: 0,
		date: new Date(),
		finish: false
	},
	afternoon: {
		time_14: 0,
		time_15: 0,
		time_16: 0,
		time_17: 0,
		time_18: 0,
		time_19: 0,
		time_20: 0,
		time_21: 0,
		afternoonShift_count: 0,
		date: new Date(),
		finish: false
	},
	night: {
		time_22: 0,
		time_23: 0,
		time_00: 0,
		time_01: 0,
		time_02: 0,
		time_03: 0,
		time_04: 0,
		time_05: 0,
		nightShift_count: 0,
		date: new Date(),
		finish: false
	},
	timestamp: new Date().toISOString()
});

// CLEAR OLD MESSAGES
export const alertMessagesFresh = derived(alertMessagesRaw, ($rawMessages) => {
	const now = Date.now();
	return $rawMessages.filter((msg) => msg.timeStamp.getTime() + MESSAGE_EXPIRY > now);
});

// STORE FUNCTIONS
function clearReconnectTimeout() {
	if (reconnectTimeoutId) {
		clearTimeout(reconnectTimeoutId);
		reconnectTimeoutId = null;
	}
}

function scheduleReconnect(machName: string) {
	clearReconnectTimeout();
	console.warn(`SSE pre ${machName}: Spojenie zlyhalo, plánujem znovupripojenie o 3s.`);
	isLoading.set(false);
	reconnectTimeoutId = window.setTimeout(() => {
		connect(machName);
	}, 5000);
}

function connect(MACHINENAME: string) {
	if (eventSourceInstance) {
		console.log(`SSE pre ${MACHINENAME}: Zatváram existujúce spojenie pred novým.`);
		eventSourceInstance.close();
		eventSourceInstance = null;
	}
	clearReconnectTimeout();

	currentMachineName = MACHINENAME;
	isLoading.set(true);
	alertMessagesRaw.set([]);
	serverAlertsStatus.set(undefined);
	serverProdDataStatus.set(undefined);

	console.log(`SSE pre ${MACHINENAME}: Pokus o pripojenie...`);
	eventSourceInstance = new EventSource(`/api/streams/${MACHINENAME}`);

	eventSourceInstance.onopen = () => {
		console.log(`SSE pre ${MACHINENAME}: Spojenie otvorené.`);
	};

	eventSourceInstance.onmessage = (event) => {
		try {
			const parseData = JSON.parse(event.data);

			if (parseData.type === 'alert') {
				serverAlertsStatus.set(parseData.payload.status);
				if (parseData.payload.msg) {
					const parsedAlert: messageAlertType = JSON.parse(parseData.payload.msg);
					const newMsg: messageAlertType = {
						id: parsedAlert.id,
						msg: parsedAlert.msg,
						timeStamp: new Date(parsedAlert.timeStamp)
					};

					alertMessagesRaw.update((current) => {
						const existingIndex = current.findIndex((m) => m.id === newMsg.id);
						if (existingIndex > -1) {
							const updated = [...current];
							updated[existingIndex] = newMsg;
							return updated;
						}
						return [...current, newMsg];
					});
				}
			} else if (parseData.type === 'prodData') {
				serverProdDataStatus.set(parseData.payload.status);
				if (parseData.payload.msg) {
					const parsedProdData = JSON.parse(parseData.payload.msg);
					currentProductionData.update((previousData) => {
						const updatedData = { ...(previousData || {}) };

						// get values from payload
						const actDowntimeValue = parsedProdData['ProdData-actDowntime'];
						const prodCurrentNumValue = parsedProdData['ProdData-prodCurrentNum'];
						const toolNumberValue = parsedProdData['ProdData-toolNumber'];
						const toolNameValue = parsedProdData['ProdData-toolName'];
						const timeStampFromPayload = parsedProdData['timeStamp'];

						if (typeof actDowntimeValue === 'number') {
							updatedData.actDowntime = actDowntimeValue;
						}
						if (typeof prodCurrentNumValue === 'number') {
							updatedData.prodCurrentNum = prodCurrentNumValue;
						}
						if (typeof toolNumberValue === 'number') {
							updatedData.toolNumber = toolNumberValue;
						}
						if (typeof toolNameValue === 'string') {
							updatedData.toolName = toolNameValue;
						}
						if (timeStampFromPayload) {
							updatedData.timeStamp = new Date(timeStampFromPayload);
						}
						return updatedData;
					});
				}
			} else if (parseData.type === 'shiftCount') {
				const shiftData = parseData.payload as ShiftCountData;
				shiftCountData.set(shiftData);
			}
			isLoading.set(false);
		} catch (e) {
			console.error(`SSE pre ${MACHINENAME}: Chyba pri spracovaní správy:`, e, event.data);
		}
	};

	eventSourceInstance.onerror = (err) => {
		console.error(`SSE pre ${MACHINENAME}: Chyba spojenia:`, err);
		scheduleReconnect(MACHINENAME);
	};
}

export function initializeMachineStream(MACHINENAME: string) {
	isLoading.set(true);
	if (currentMachineName === MACHINENAME && eventSourceInstance) {
		console.log(`SSE pre ${MACHINENAME}: Stream už beží.`);
		isLoading.set(false);
		return;
	}
	connect(MACHINENAME);
}

export function closeMachineStream() {
	clearReconnectTimeout();
	if (eventSourceInstance) {
		console.log(`SSE pre ${currentMachineName || 'unknown'}: Manuálne zatváranie streamu.`);
		eventSourceInstance.close();
		eventSourceInstance = null;
	}

	isLoading.set(false);
	// alertMessagesRaw.set([]);
	currentMachineName = null;
}
