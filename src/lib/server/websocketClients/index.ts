import { machinesConfigConst } from '$lib/utils/constants/constants';
import { ManagedWebSocketClient } from './nodeRedClient';

// EQC 8
export const WS_eqc8ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc8.name,
	url: machinesConfigConst.eqc8.url_alert
});
export const WS_eqc8ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc8.name,
	url: machinesConfigConst.eqc8.url_data
});

// EQC 7
export const WS_eqc7ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc7.name,
	url: machinesConfigConst.eqc7.url_alert
});
export const WS_eqc7ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc7.name,
	url: machinesConfigConst.eqc7.url_data
});

WS_eqc8ClientAlert.start();
WS_eqc8ClientProdData.start();
WS_eqc7ClientAlert.start();
WS_eqc7ClientProdData.start();


