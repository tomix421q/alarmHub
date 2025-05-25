import { WS_eqc8ClientProdData } from '$lib/server/websocketClients';

interface EmittedWebSocketData {
	msg?: string;
	status: {
		name: string;
		url: string;
		isConnected: boolean;
		manualShutdown: boolean;
		WSserverInfo: string;
		WSserverError: string;
	};
}

// let onProductData: (data: EmittedWebSocketData) => void;

// function onProductData(data: EmittedWebSocketData) {
// 	console.log(data);
// }

if (WS_eqc8ClientProdData) {
	WS_eqc8ClientProdData.emitter.on('message', (data) => {
		// console.log(data);
	});
}
