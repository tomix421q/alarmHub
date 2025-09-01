import { machinesConfigConst } from '$lib/utils/constants/constants';
import { ManagedWebSocketClient } from './nodeRedClient';

// EQC 8 HMI & PRODDATA
export const WS_eqc8ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc8.name,
	url: machinesConfigConst.eqc8.url_alert
});
export const WS_eqc8ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc8.name,
	url: machinesConfigConst.eqc8.url_data
});

// EQC 7 HMI & PRODDATA
export const WS_eqc7ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc7.name,
	url: machinesConfigConst.eqc7.url_alert
});
export const WS_eqc7ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc7.name,
	url: machinesConfigConst.eqc7.url_data
});

// EQC 6 HMI & PRODDATA
export const WS_eqc6ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc6.name,
	url: machinesConfigConst.eqc6.url_alert
});
export const WS_eqc6ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc6.name,
	url: machinesConfigConst.eqc6.url_data
});

// EQC 5 HMI & PRODDATA
export const WS_eqc5ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc5.name,
	url: machinesConfigConst.eqc5.url_alert
});
export const WS_eqc5ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc5.name,
	url: machinesConfigConst.eqc5.url_data
});

// EQC 4 HMI & PRODDATA
export const WS_eqc4ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc4.name,
	url: machinesConfigConst.eqc4.url_alert
});
export const WS_eqc4ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc4.name,
	url: machinesConfigConst.eqc4.url_data
});

// EQC 3 HMI & PRODDATA
export const WS_eqc3ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc3.name,
	url: machinesConfigConst.eqc3.url_alert
});
export const WS_eqc3ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc3.name,
	url: machinesConfigConst.eqc3.url_data
});

// EQC 2 HMI & PRODDATA
export const WS_eqc2ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc2.name,
	url: machinesConfigConst.eqc2.url_alert
});
export const WS_eqc2ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc2.name,
	url: machinesConfigConst.eqc2.url_data
});

// EQC 1 HMI & PRODDATA
export const WS_eqc1ClientAlert = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc1.name,
	url: machinesConfigConst.eqc1.url_alert
});
export const WS_eqc1ClientProdData = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc1.name,
	url: machinesConfigConst.eqc1.url_data
});

WS_eqc8ClientAlert.start();
WS_eqc8ClientProdData.start();
WS_eqc7ClientAlert.start();
WS_eqc7ClientProdData.start();
WS_eqc6ClientAlert.start();
WS_eqc6ClientProdData.start();
WS_eqc5ClientAlert.start();
WS_eqc5ClientProdData.start();
WS_eqc4ClientAlert.start();
WS_eqc4ClientProdData.start();
WS_eqc3ClientAlert.start();
WS_eqc3ClientProdData.start();
WS_eqc2ClientAlert.start();
WS_eqc2ClientProdData.start();
WS_eqc1ClientAlert.start();
WS_eqc1ClientProdData.start();
