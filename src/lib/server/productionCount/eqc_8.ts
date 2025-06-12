import type {
	afternoonShift_count,
	morningShift_count,
	nightShift_count
} from '$lib/utils/types/serverTypes';
import { WS_eqc8ClientProdData } from '../websocketClients';

// MORNING
export let morningShiftCounting: morningShift_count = {
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
function totalSum_morningShift() {
	if (morningShiftCounting.time_06 === 0) {
		morningShiftCounting.date = new Date();
	}
	if (nightShiftCounting.finish === false) {
		nightShiftCounting.finish = true;
	}
	return (morningShiftCounting.morningShift_count =
		morningShiftCounting.time_06 +
		morningShiftCounting.time_07 +
		morningShiftCounting.time_08 +
		morningShiftCounting.time_09 +
		morningShiftCounting.time_10 +
		morningShiftCounting.time_11 +
		morningShiftCounting.time_12 +
		morningShiftCounting.time_13);
}

// AFTERNOON
export let afternoonShiftCounting: afternoonShift_count = {
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
function totalSum_afternoonShift() {
	if (afternoonShiftCounting.time_14 === 0) {
		afternoonShiftCounting.date = new Date();
	}
	if (morningShiftCounting.finish === false) {
		morningShiftCounting.finish = true;
	}
	return (afternoonShiftCounting.afternoonShift_count =
		afternoonShiftCounting.time_14 +
		afternoonShiftCounting.time_15 +
		afternoonShiftCounting.time_16 +
		afternoonShiftCounting.time_17 +
		afternoonShiftCounting.time_18 +
		afternoonShiftCounting.time_19 +
		afternoonShiftCounting.time_20 +
		afternoonShiftCounting.time_21);
}

//NIGHT
export let nightShiftCounting: nightShift_count = {
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
function totalSum_nightShift() {
	if (nightShiftCounting.time_22 === 0) {
		nightShiftCounting.date = new Date();
	}
	if (afternoonShiftCounting.finish === false) {
		afternoonShiftCounting.finish = true;
	}
	return (nightShiftCounting.nightShift_count =
		nightShiftCounting.time_22 +
		nightShiftCounting.time_23 +
		nightShiftCounting.time_00 +
		nightShiftCounting.time_01 +
		nightShiftCounting.time_02 +
		nightShiftCounting.time_03 +
		nightShiftCounting.time_04 +
		nightShiftCounting.time_05);
}


// CORE FUNC
export function aggregateShift() {
	let oldValue = 0;
	WS_eqc8ClientProdData.emitter.on('message', (data) => {
		if (data.msg !== undefined) {
			let parse = JSON.parse(data.msg);
			let count = parse['ProdData-prodCurrentNum'];
			let timestamp = parse['timeStamp'];

			if (count && oldValue < count) {
				oldValue = count;
				const messageHour = new Date(timestamp).getHours();
				switch (messageHour) {
					case 6:
						if (morningShiftCounting.finish) {
							morningShiftCounting.time_06 = 0;
							morningShiftCounting.time_07 = 0;
							morningShiftCounting.time_08 = 0;
							morningShiftCounting.time_09 = 0;
							morningShiftCounting.time_10 = 0;
							morningShiftCounting.time_11 = 0;
							morningShiftCounting.time_12 = 0;
							morningShiftCounting.time_13 = 0;
							morningShiftCounting.morningShift_count = 0;
						}

						morningShiftCounting.time_06++;
						totalSum_morningShift();
						break;
					case 7:
						morningShiftCounting.time_07++;
						totalSum_morningShift();
						break;
					case 8:
						morningShiftCounting.time_08++;
						totalSum_morningShift();
						break;
					case 9:
						morningShiftCounting.time_09++;
						totalSum_morningShift();
						break;
					case 10:
						morningShiftCounting.time_10++;
						totalSum_morningShift();
						break;
					case 11:
						morningShiftCounting.time_11++;
						totalSum_morningShift();
						break;
					case 12:
						morningShiftCounting.time_12++;
						totalSum_morningShift();
						break;
					case 13:
						morningShiftCounting.time_13++;
						totalSum_morningShift();
						break;
					case 14:
						if (afternoonShiftCounting.finish) {
							afternoonShiftCounting.time_14 = 0;
							afternoonShiftCounting.time_15 = 0;
							afternoonShiftCounting.time_16 = 0;
							afternoonShiftCounting.time_17 = 0;
							afternoonShiftCounting.time_18 = 0;
							afternoonShiftCounting.time_19 = 0;
							afternoonShiftCounting.time_20 = 0;
							afternoonShiftCounting.time_21 = 0;
							afternoonShiftCounting.afternoonShift_count = 0;
						}

						afternoonShiftCounting.time_14++;
						totalSum_afternoonShift();
						break;
					case 15:
						afternoonShiftCounting.time_15++;
						totalSum_afternoonShift();
						break;
					case 16:
						afternoonShiftCounting.time_16++;
						totalSum_afternoonShift();
						break;
					case 17:
						afternoonShiftCounting.time_17++;
						totalSum_afternoonShift();
						break;
					case 18:
						afternoonShiftCounting.time_18++;
						totalSum_afternoonShift();
						break;
					case 19:
						afternoonShiftCounting.time_19++;
						totalSum_afternoonShift();
						break;
					case 20:
						afternoonShiftCounting.time_20++;
						totalSum_afternoonShift();
						break;
					case 21:
						afternoonShiftCounting.time_21++;
						totalSum_afternoonShift();
						break;
					case 22:
						if (nightShiftCounting.finish) {
							nightShiftCounting.time_22 = 0;
							nightShiftCounting.time_23 = 0;
							nightShiftCounting.time_00 = 0;
							nightShiftCounting.time_01 = 0;
							nightShiftCounting.time_02 = 0;
							nightShiftCounting.time_03 = 0;
							nightShiftCounting.time_04 = 0;
							nightShiftCounting.time_05 = 0;
							nightShiftCounting.nightShift_count = 0;
						}

						nightShiftCounting.time_22++;
						totalSum_nightShift();
						break;
					case 23:
						nightShiftCounting.time_23++;
						totalSum_nightShift();
						break;
					case 0:
						nightShiftCounting.time_00++;
						totalSum_nightShift();
						break;
					case 1:
						nightShiftCounting.time_01++;
						totalSum_nightShift();
						break;
					case 2:
						nightShiftCounting.time_02++;
						totalSum_nightShift();
						break;
					case 3:
						nightShiftCounting.time_03++;
						totalSum_nightShift();
						break;
					case 4:
						nightShiftCounting.time_04++;
						totalSum_nightShift();
						break;
					case 5:
						nightShiftCounting.time_05++;
						totalSum_nightShift();
						break;
					default:
						console.warn('Unexpected hour:', messageHour);
				}
				// console.log('Actual Morning Shift: ' + morningShiftCounting.morningShift_count);
				// console.log('Actual Afternoon Shift: ' + afternoonShiftCounting.afternoonShift_count);
				// console.log('Actual Night Shift: ' + nightShiftCounting.nightShift_count);
			}
		}
	});
}
aggregateShift();
