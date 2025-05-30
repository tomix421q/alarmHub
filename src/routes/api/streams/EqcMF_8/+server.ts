import {
	afternoonShiftCounting,
	morningShiftCounting,
	nightShiftCounting
} from '$lib/server/productionCount/eqc_8';
import { WS_eqc8ClientAlert, WS_eqc8ClientProdData } from '$lib/server/websocketClients';
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
interface ShiftCountData {
	morning: typeof morningShiftCounting;
	afternoon: typeof afternoonShiftCounting;
	night: typeof nightShiftCounting;
	timestamp: string;
}

interface SSEDataPayload {
	type: 'alert' | 'prodData' | 'shiftCount';
	payload: EmittedWebSocketData | ShiftCountData;
}
//SSE
export const GET: RequestHandler = ({ request }) => {
	let onAlertDataHandler: (data: EmittedWebSocketData) => void;
	let onProdDataHandler: (data: EmittedWebSocketData) => void;
	let shiftCountInterval: NodeJS.Timeout;

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

			onAlertDataHandler = (data) => {
				sendSseData({ type: 'alert', payload: data });
			};

			onProdDataHandler = (data) => {
				sendSseData({ type: 'prodData', payload: data });
			};

			WS_eqc8ClientAlert.emitter.on('message', onAlertDataHandler);
			WS_eqc8ClientProdData.emitter.on('message', onProdDataHandler);

			// shift part count
			shiftCountInterval = setInterval(() => {
				const shiftData: ShiftCountData = {
					morning: morningShiftCounting,
					afternoon: afternoonShiftCounting,
					night: nightShiftCounting,
					timestamp: new Date().toISOString()
				};

				sendSseData({ type: 'shiftCount', payload: shiftData });
			}, 5000);

			request.signal.addEventListener('abort', () => {
				if (onAlertDataHandler) {
					WS_eqc8ClientAlert.emitter.off('message', onAlertDataHandler);
				}
				if (onProdDataHandler) {
					WS_eqc8ClientProdData.emitter.off('message', onProdDataHandler);
				}
				if (shiftCountInterval) {
					clearInterval(shiftCountInterval);
				}
			});
		},

		cancel(reason) {
			if (onAlertDataHandler) {
				WS_eqc8ClientAlert.emitter.off('message', onAlertDataHandler);
				// console.log('Zatvaram message emitter')
			}
			if (onProdDataHandler) {
				WS_eqc8ClientProdData.emitter.off('message', onProdDataHandler);
				// console.log('Zatvaram data emitter');
			}
			if (shiftCountInterval) {
				clearInterval(shiftCountInterval);
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
