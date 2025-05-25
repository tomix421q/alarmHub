import WebSocket from 'ws';
import prismaClient from '../prisma';
import { EventEmitter } from 'events';
import { MACHINEFILTERERRORS } from '$lib/utils/constants/constants';

interface WsClientOptions {
	name: string;
	url: string;
	reconnectInterval?: number;
}

export class ManagedWebSocketClient {
	private ws: WebSocket | null = null;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private statusInterval: NodeJS.Timeout | null = null;
	// GET STATUS VARS
	private isConnected = false;
	private manualShutdown = false;
	private serverInfo = '';
	private serverError = '';
	//
	private readonly reconnectInterval: number;

	public readonly emitter = new EventEmitter();

	constructor(private options: WsClientOptions) {
		this.reconnectInterval = options.reconnectInterval ?? 60000;
	}

	public start() {
		this.manualShutdown = false;
		this.serverInfo = 'Trying to connect.';
		this.statusUpdates();
		this.connect();
	}
	public stop() {
		this.manualShutdown = true;
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
	private statusUpdates() {
		if (this.statusInterval) {
			clearInterval(this.statusInterval);
			this.statusInterval = null;
		}

		this.statusInterval = setInterval(() => {
			this.emitter.emit('message', { status: this.getStatus() });
			// console.log(this.getStatus());
		}, 10000);
	}

	private connect() {
		this.ws = new WebSocket(this.options.url);

		this.ws.on('open', async () => {
			this.isConnected = true;
			this.serverInfo = `WebSocket connected: ${this.options.name}`;
			this.emitter.emit('message', { status: this.getStatus() });

			try {
				await prismaClient.machines.upsert({
					where: { name: this.options.name },
					update: { name: this.options.name },
					create: { name: this.options.name }
				});
				// console.log(`Stroj ${this.options.name} zaregistrovaný/aktualizovaný v DB`);
			} catch (e) {
				console.error('Chyba pri upserte stroja:', e);
			}
			this.emitter.emit('message', { status: this.getStatus() });
			this.emitter.emit('open');
		});

		this.ws.on('message', (data) => {
			const msg = typeof data === 'string' ? data : data.toString();
			this.serverError = '';
			this.emitter.emit('message', { msg, status: this.getStatus() });
		});

		this.ws.on('close', () => {
			this.isConnected = false;
			this.serverInfo = `WebSocket ${this.options.name} connection closed`;
			this.emitter.emit('close');
			this.emitter.emit('message', { status: this.getStatus() });

			if (!this.manualShutdown) {
				this.scheduleReconnect();
				this.logSocketError('WebSocket connection closed unexpectedly');
			}
		});

		this.ws.on('error', (err) => {
			this.isConnected = false;
			this.serverError = `WebSocket error ${this.options.name}:` + err;
			this.emitter.emit('message', { status: this.getStatus() });
			this.logSocketError(err.message);
			if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
				this.ws.close();
			}
		});
	}

	private scheduleReconnect() {
		if (this.reconnectTimer || this.isConnected) return;
		console.log(`Scheduling reconnect for ${this.options.name} in ${this.reconnectInterval} ms`);
		this.serverInfo = `Scheduling reconnect for ${this.options.name} in ${this.reconnectInterval} ms`;
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			if (!this.manualShutdown) {
				this.connect();
			}
		}, this.reconnectInterval);
	}
	private async logSocketError(message: string) {
		this.serverError = message;
		if (MACHINEFILTERERRORS.includes(message)) return;
		try {
			const machine = await prismaClient.machines.findUnique({
				where: { name: this.options.name }
			});
			if (!machine) {
				console.warn(`Stroj s menom ${this.options.name} nenájdený v DB, nepridám socket error.`);
				return;
			}
			await prismaClient.socketError.create({
				data: {
					machineId: machine.id,
					message
				}
			});
		} catch (e) {
			this.serverError = `DB prisma error ${e}`;
			// console.error('Chyba pri zápise websocket error do DB:', e);
		}
	}

	public getStatus() {
		return {
			name: this.options.name,
			url: this.options.url,
			isConnected: this.isConnected,
			manualShutdown: this.manualShutdown,
			WSserverInfo: this.serverInfo,
			WSserverError: this.serverError,
			lastUpdate: new Date().toLocaleTimeString()
		};
	}
}
