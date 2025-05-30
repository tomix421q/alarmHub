<script lang="ts">
	import Header from '$lib/components/molecules/HeaderText.svelte';
	import { LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import {
		type ErrorResponse,
		type MachineDbType,
		type SuccessResponse
	} from '$lib/utils/types/machineTypes.js';
	import type { PageProps } from './$types.js';
	import HmiNote from '$lib/components/organism/HmiNote.svelte';
	import StateZone from '$lib/components/molecules/StateZone.svelte';
	import HmiDisplay from '$lib/components/organism/HmiDisplay.svelte';
	import {
		alertMessagesFresh,
		closeMachineStream,
		currentProductionData,
		initializeMachineStream,
		isLoading,
		serverAlertsStatus,
		serverProdDataStatus,
		shiftCountData
	} from '$lib/stores/sseConnectStore.js';
	import MachineInfo from '$lib/components/molecules/MachineInfo.svelte';
	import ChartProduction from '$lib/components/molecules/ChartProduction.svelte';

	let { data, form }: PageProps = $props();

	const MACHINENAME = data.MACHINENAME;

	let loading = $derived($isLoading);
	let messages = $derived($alertMessagesFresh);
	let WSserverAlertsStatus = $derived($serverAlertsStatus);
	let WSserverProdDataStatus = $derived($serverProdDataStatus);
	let currentProduction = $derived($currentProductionData);

	let DB_dataStatus = $derived<ErrorResponse | SuccessResponse<MachineDbType>>(data.dbdata);
	let alertList = $derived(data.machineAlertsListMap);

	onMount(() => {
		initializeMachineStream(MACHINENAME);

		return () => {
			closeMachineStream();
		};
	});
</script>

<main class="mt-6 flex flex-wrap justify-between gap-y-13 md:mt-12 lg:max-w-[1400px]">
	<!-- HMI -->
	<section
		class=" relative flex min-h-[18.75rem] w-full flex-col rounded-lg border shadow-2xl lg:w-5xl lg:p-3"
	>
		<Header text="Hmi Live Alerts" classNameh1="!w-fit" />
		{#if loading}
			<span
				class="bg-muted-foreground text-primary flex !min-h-[15.625rem] animate-pulse flex-col items-center justify-center text-lg font-semibold uppercase md:text-2xl"
				>Loading data from hmi... <LoaderCircle
					class="text-destructive size-12 animate-spin"
				/></span
			>
		{:else if !WSserverAlertsStatus?.isConnected}
			<span
				class="bg-destructive text-primary flex h-auto !min-h-[15.625rem] animate-pulse flex-col items-center justify-center text-lg font-semibold uppercase md:text-2xl"
				>Lost Connection</span
			>
		{:else}
			<HmiDisplay {messages} {DB_dataStatus} />
		{/if}
	</section>

	<!-- STATE ZONE -->
	<section class="flex max-h-[37.5rem] w-full flex-col rounded-lg border p-3 shadow-2xl md:w-xs">
		<Header text="State {WSserverAlertsStatus?.name}" classNameh1="!text-2xl" />
		<StateZone {WSserverAlertsStatus} {WSserverProdDataStatus} {DB_dataStatus} />
	</section>

	<!-- CHART ZONE -->
	<section class="flex max-h-[37.5rem] w-full flex-col rounded-lg border p-3 shadow-2xl lg:w-5xl">
		<Header text="Production part chart" />
		<ChartProduction />
	</section>

	<!-- PRODUCTION DATA -->
	<section class="flex max-h-[500px] w-full flex-col rounded-lg border p-3 shadow-2xl lg:w-xs">
		<Header text="Machine raw data" classNameh1="w-fit" />
		<div class="h-full">
			{#if currentProduction}
				<MachineInfo />
			{:else}
				<span class="mt-12 flex justify-center gap-x-2"
					><LoaderCircle class="animate-spin text-sm font-semibold" /> Loading Data...</span
				>
			{/if}
		</div>
	</section>

	<!-- NOTE ZONE -->
	<section class="flex w-full flex-col rounded-lg border p-3 shadow-2xl lg:w-4xl">
		<Header text="Fault note" />
		{#if DB_dataStatus.success}
			<HmiNote {DB_dataStatus} {form} {alertList} />
		{/if}
	</section>
</main>
