import { WS_eqc8Client } from '$lib/server/websocketClients';
import type { RequestHandler } from '@sveltejs/kit';

//SSE
export const GET: RequestHandler = ({ request }) => {
	let onData: (data: string) => void;

	const stream = new ReadableStream({
		start(controller) {
			onData = (data: string) => {
				try {
					controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
				} catch (e) {
					console.warn('SSE enqueue error:', e);
					WS_eqc8Client.emitter.off('message', onData);
					controller.close();
				}
			};

			WS_eqc8Client.emitter.on('message', onData);

			request.signal.addEventListener('abort', () => {
				WS_eqc8Client.emitter.off('message', onData);
				controller.close();
			});
		},
		cancel() {
			if (onData) {
				WS_eqc8Client.emitter.off('message', onData);
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
