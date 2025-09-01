import type { EventEmitter } from 'events';
import type {
	afternoonShift_count,
	morningShift_count,
	nightShift_count
} from '$lib/utils/types/serverTypes';

export class ShiftAggregator {
	private emitter: EventEmitter;

	private machineName: string;
	private oldValue = 0;

	public morningShiftCounting: morningShift_count;
	public afternoonShiftCounting: afternoonShift_count;
	public nightShiftCounting: nightShift_count;

	constructor(emitter: EventEmitter, machineName: string) {
		this.emitter = emitter;
		this.emitter.setMaxListeners(50);
		this.machineName = machineName;

		this.morningShiftCounting = {
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
		};
		this.afternoonShiftCounting = {
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
		};
		this.nightShiftCounting = {
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
		};

		this.aggregateShift();
	}

	private totalSum_morningShift() {
		if (this.morningShiftCounting.time_06 === 0) {
			this.morningShiftCounting.date = new Date();
		}
		if (this.nightShiftCounting.finish === false) {
			this.nightShiftCounting.finish = true;
		}
		return (this.morningShiftCounting.morningShift_count =
			this.morningShiftCounting.time_06 +
			this.morningShiftCounting.time_07 +
			this.morningShiftCounting.time_08 +
			this.morningShiftCounting.time_09 +
			this.morningShiftCounting.time_10 +
			this.morningShiftCounting.time_11 +
			this.morningShiftCounting.time_12 +
			this.morningShiftCounting.time_13);
	}

	private totalSum_afternoonShift() {
		if (this.afternoonShiftCounting.time_14 === 0) {
			this.afternoonShiftCounting.date = new Date();
		}
		if (this.morningShiftCounting.finish === false) {
			this.morningShiftCounting.finish = true;
		}
		return (this.afternoonShiftCounting.afternoonShift_count =
			this.afternoonShiftCounting.time_14 +
			this.afternoonShiftCounting.time_15 +
			this.afternoonShiftCounting.time_16 +
			this.afternoonShiftCounting.time_17 +
			this.afternoonShiftCounting.time_18 +
			this.afternoonShiftCounting.time_19 +
			this.afternoonShiftCounting.time_20 +
			this.afternoonShiftCounting.time_21);
	}

	private totalSum_nightShift() {
		if (this.nightShiftCounting.time_22 === 0) {
			this.nightShiftCounting.date = new Date();
		}
		if (this.afternoonShiftCounting.finish === false) {
			this.afternoonShiftCounting.finish = true;
		}
		return (this.nightShiftCounting.nightShift_count =
			this.nightShiftCounting.time_22 +
			this.nightShiftCounting.time_23 +
			this.nightShiftCounting.time_00 +
			this.nightShiftCounting.time_01 +
			this.nightShiftCounting.time_02 +
			this.nightShiftCounting.time_03 +
			this.nightShiftCounting.time_04 +
			this.nightShiftCounting.time_05);
	}

	private aggregateShift() {
		this.emitter.on('message', (data) => {
			if (data.msg !== undefined) {
				let parse = JSON.parse(data.msg);
				let count = parse['ProdData-prodCurrentNum'];
				let timestamp = parse['timeStamp'];

				if (count && this.oldValue < count) {
					this.oldValue = count;
					const messageHour = new Date(timestamp).getHours();
					switch (messageHour) {
						case 6:
							if (this.morningShiftCounting.finish) {
								this.morningShiftCounting = {
									...this.morningShiftCounting,
									time_06: 0,
									time_07: 0,
									time_08: 0,
									time_09: 0,
									time_10: 0,
									time_11: 0,
									time_12: 0,
									time_13: 0,
									morningShift_count: 0,
									finish: false
								};
							}
							this.morningShiftCounting.time_06++;
							this.totalSum_morningShift();
							break;
						case 7:
							this.morningShiftCounting.time_07++;
							this.totalSum_morningShift();
							break;
						case 8:
							this.morningShiftCounting.time_08++;
							this.totalSum_morningShift();
							break;
						case 9:
							this.morningShiftCounting.time_09++;
							this.totalSum_morningShift();
							break;
						case 10:
							this.morningShiftCounting.time_10++;
							this.totalSum_morningShift();
							break;
						case 11:
							this.morningShiftCounting.time_11++;
							this.totalSum_morningShift();
							break;
						case 12:
							this.morningShiftCounting.time_12++;
							this.totalSum_morningShift();
							break;
						case 13:
							this.morningShiftCounting.time_13++;
							this.totalSum_morningShift();
							break;

						case 14:
							if (this.afternoonShiftCounting.finish) {
								this.afternoonShiftCounting = {
									...this.afternoonShiftCounting,
									time_14: 0,
									time_15: 0,
									time_16: 0,
									time_17: 0,
									time_18: 0,
									time_19: 0,
									time_20: 0,
									time_21: 0,
									afternoonShift_count: 0,
									finish: false
								};
							}
							this.afternoonShiftCounting.time_14++;
							this.totalSum_afternoonShift();
							break;
						case 15:
							this.afternoonShiftCounting.time_15++;
							this.totalSum_afternoonShift();
							break;
						case 16:
							this.afternoonShiftCounting.time_16++;
							this.totalSum_afternoonShift();
							break;
						case 17:
							this.afternoonShiftCounting.time_17++;
							this.totalSum_afternoonShift();
							break;
						case 18:
							this.afternoonShiftCounting.time_18++;
							this.totalSum_afternoonShift();
							break;
						case 19:
							this.afternoonShiftCounting.time_19++;
							this.totalSum_afternoonShift();
							break;
						case 20:
							this.afternoonShiftCounting.time_20++;
							this.totalSum_afternoonShift();
							break;
						case 21:
							this.afternoonShiftCounting.time_21++;
							this.totalSum_afternoonShift();
							break;

						case 22:
							if (this.nightShiftCounting.finish) {
								this.nightShiftCounting = {
									...this.nightShiftCounting,
									time_22: 0,
									time_23: 0,
									time_00: 0,
									time_01: 0,
									time_02: 0,
									time_03: 0,
									time_04: 0,
									time_05: 0,
									nightShift_count: 0,
									finish: false
								};
							}
							this.nightShiftCounting.time_22++;
							this.totalSum_nightShift();
							break;
						case 23:
							this.nightShiftCounting.time_23++;
							this.totalSum_nightShift();
							break;
						case 0:
							this.nightShiftCounting.time_00++;
							this.totalSum_nightShift();
							break;
						case 1:
							this.nightShiftCounting.time_01++;
							this.totalSum_nightShift();
							break;
						case 2:
							this.nightShiftCounting.time_02++;
							this.totalSum_nightShift();
							break;
						case 3:
							this.nightShiftCounting.time_03++;
							this.totalSum_nightShift();
							break;
						case 4:
							this.nightShiftCounting.time_04++;
							this.totalSum_nightShift();
							break;
						case 5:
							this.nightShiftCounting.time_05++;
							this.totalSum_nightShift();
							break;

						default:
							console.warn(`[${this.machineName}] Unexpected hour:`, messageHour);
					}
				}
			}
		});
	}
}
