import { machinesConfigConst } from '$lib/utils/constants/constants';
import {
	WS_eqc1ClientProdData,
	WS_eqc2ClientProdData,
	WS_eqc3ClientProdData,
	WS_eqc4ClientProdData,
	WS_eqc5ClientProdData,
	WS_eqc6ClientProdData,
	WS_eqc7ClientProdData,
	WS_eqc8ClientProdData
} from '../websocketClients';
import { ShiftAggregator } from './shiftAgregatorEqcMf';

export const eqc8mf_aggregatorCount = new ShiftAggregator(
	WS_eqc8ClientProdData.emitter,
	machinesConfigConst.eqc8.name
);

export const eqc7mf_aggregatorCount = new ShiftAggregator(
	WS_eqc7ClientProdData.emitter,
	machinesConfigConst.eqc7.name
);

export const eqc6mf_aggregatorCount = new ShiftAggregator(
	WS_eqc6ClientProdData.emitter,
	machinesConfigConst.eqc6.name
);

export const eqc5mf_aggregatorCount = new ShiftAggregator(
	WS_eqc5ClientProdData.emitter,
	machinesConfigConst.eqc5.name
);

export const eqc4mf_aggregatorCount = new ShiftAggregator(
	WS_eqc4ClientProdData.emitter,
	machinesConfigConst.eqc4.name
);

export const eqc3mf_aggregatorCount = new ShiftAggregator(
	WS_eqc3ClientProdData.emitter,
	machinesConfigConst.eqc3.name
);

export const eqc2mf_aggregatorCount = new ShiftAggregator(
	WS_eqc2ClientProdData.emitter,
	machinesConfigConst.eqc2.name
);

export const eqc1mf_aggregatorCount = new ShiftAggregator(
	WS_eqc1ClientProdData.emitter,
	machinesConfigConst.eqc1.name
);
