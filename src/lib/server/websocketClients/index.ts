import { machinesConfigConst } from '$lib/utils/constants/constants';
import { ManagedWebSocketClient } from './nodeRedClient';

export const WS_eqc8Client = new ManagedWebSocketClient({
	name: machinesConfigConst.eqc8.name,
	url: machinesConfigConst.eqc8.url
});

WS_eqc8Client.emitter.on('open', () => console.log('Pripojenie otvorené'));
// WS_eqc8Client.emitter.emit('message', { status: WS_eqc8Client.getStatus() });
WS_eqc8Client.emitter.on('close', () => console.log('Pripojenie zatvorené'));
WS_eqc8Client.emitter.on('error', (err) => console.error('Chyba:', err));

WS_eqc8Client.start();
// WS_eqc8Client.stop()
