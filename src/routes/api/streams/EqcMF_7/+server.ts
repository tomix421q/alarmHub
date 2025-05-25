import { WS_eqc7ClientAlert, WS_eqc7ClientProdData } from '$lib/server/websocketClients';
import type { RequestHandler } from '@sveltejs/kit';
interface EmittedWebSocketData {
	msg?: string;
	status: {
		name: string;
		url: string;
		isConnected: boolean;
		manualShutdown: boolean;
		WSserverInfo: string;
		WSserverError: string;
		lastUpdate: Date;
	};
}
interface SSEDataPayload {
	type: 'alert' | 'prodData';
	payload: EmittedWebSocketData;
}
//SSE
export const GET: RequestHandler = ({ request }) => {
	let onAlertDataHandler: (data: EmittedWebSocketData) => void;
	let onProdDataHandler: (data: EmittedWebSocketData) => void;

	const stream = new ReadableStream({
		start(controller) {
			const sendSseData = (dataToSend: SSEDataPayload) => {
				if (request.signal.aborted) {
					console.warn('Pokus o odoslanie dát na prerušené SSE spojenie.');
					return;
				}
				try {
					controller.enqueue(`data: ${JSON.stringify(dataToSend)}\n\n`);
				} catch (e) {
					console.warn(`SSE chyba pri enqueue pre typ ${dataToSend.type}:`, e);
				}
			};

			// Handler pre správy z WS_eqc8ClientAlert
			onAlertDataHandler = (data) => {
				sendSseData({ type: 'alert', payload: data });
			};

			// Handler pre správy z WS_eqc8ClientProdData
			onProdDataHandler = (data) => {
				sendSseData({ type: 'prodData', payload: data });
			};

			WS_eqc7ClientAlert.emitter.on('message', onAlertDataHandler);
			WS_eqc7ClientProdData.emitter.on('message', onProdDataHandler);

			request.signal.addEventListener('abort', () => {
				if (onAlertDataHandler) {
					WS_eqc7ClientAlert.emitter.off('message', onAlertDataHandler);
				}
				if (onProdDataHandler) {
					WS_eqc7ClientProdData.emitter.off('message', onProdDataHandler);
				}
			});
		},

		cancel(reason) {
			if (onAlertDataHandler) {
				WS_eqc7ClientAlert.emitter.off('message', onAlertDataHandler);
				// console.log('Zatvaram message emitter')
			}
			if (onProdDataHandler) {
				WS_eqc7ClientProdData.emitter.off('message', onProdDataHandler);
				// console.log('Zatvaram data emitter');
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
