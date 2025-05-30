<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	// @ts-ignore
	import { scaleBand } from 'd3-scale';
	// @ts-ignore
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { shiftCountData } from '$lib/stores/sseConnectStore';
	import Button from '../ui/button/button.svelte';
	import { onMount } from 'svelte';
	import { cn } from '../ui/utils';
	import { Play } from 'lucide-svelte';
	import { RadioTower } from '@lucide/svelte';
	import { svelteTime } from 'svelte-time/svelte-time.svelte';
	import Time from 'svelte-time/Time.svelte';

	let activeMorningShift = $state(false);
	let activeAfternoonShift = $state(false);
	let activeNightShift = $state(false);
	let liveShift = $state('');

	let actuallHod = $state(new Date().getHours());

	onMount(() => {
		if (actuallHod >= 22 || (actuallHod >= 0 && actuallHod < 6)) {
			activeNightShift = true;
			liveShift = 'night';
		} else if (actuallHod >= 6 && actuallHod < 14) {
			activeMorningShift = true;
			liveShift = 'morning';
		} else if (actuallHod >= 14 && actuallHod < 22) {
			activeAfternoonShift = true;
			liveShift = 'afternoon';
		}
	});

	$effect(() => {
		if (actuallHod >= 22 || (actuallHod >= 0 && actuallHod < 6)) {
			liveShift = 'night';
		} else if (actuallHod >= 6 && actuallHod < 14) {
			liveShift = 'morning';
		} else if (actuallHod >= 14 && actuallHod < 22) {
			liveShift = 'afternoon';
		}
	});

	function setMorningShift() {
		activeMorningShift = true;
		activeAfternoonShift = false;
		activeNightShift = false;
	}

	function setAfternoonShift() {
		activeMorningShift = false;
		activeAfternoonShift = true;
		activeNightShift = false;
	}

	function setNightShift() {
		activeMorningShift = false;
		activeAfternoonShift = false;
		activeNightShift = true;
	}

	const morningShiftData = $derived([
		{ time: '06h', count: Number($shiftCountData.morning.time_06) },
		{ time: '07h', count: $shiftCountData.morning.time_07 },
		{ time: '08h', count: $shiftCountData.morning.time_08 },
		{ time: '09h', count: $shiftCountData.morning.time_09 },
		{ time: '10h', count: $shiftCountData.morning.time_10 },
		{ time: '11h', count: $shiftCountData.morning.time_11 },
		{ time: '12h', count: $shiftCountData.morning.time_12 },
		{ time: '13h', count: $shiftCountData.morning.time_13 }
	]);
	const afternoonShiftData = $derived([
		{ time: '14h', count: $shiftCountData.afternoon.time_14 },
		{ time: '15h', count: $shiftCountData.afternoon.time_15 },
		{ time: '16h', count: $shiftCountData.afternoon.time_16 },
		{ time: '17h', count: $shiftCountData.afternoon.time_17 },
		{ time: '18h', count: $shiftCountData.afternoon.time_18 },
		{ time: '19h', count: $shiftCountData.afternoon.time_19 },
		{ time: '20h', count: $shiftCountData.afternoon.time_20 },
		{ time: '21h', count: $shiftCountData.afternoon.time_21 }
	]);
	const nightShiftData = $derived([
		{ time: '22h', count: $shiftCountData.night.time_22 },
		{ time: '23h', count: $shiftCountData.night.time_23 },
		{ time: '00h', count: $shiftCountData.night.time_00 },
		{ time: '01h', count: $shiftCountData.night.time_01 },
		{ time: '02h', count: $shiftCountData.night.time_02 },
		{ time: '03h', count: $shiftCountData.night.time_03 },
		{ time: '04h', count: $shiftCountData.night.time_04 },
		{ time: '05h', count: $shiftCountData.night.time_05 }
	]);
	const chartConfig = {
		time: { label: 'Time', color: 'hsl(228, 96%, 89%)' }
	} satisfies Chart.ChartConfig;

</script>

<main class="flex w-full flex-col lg:flex-row">
	<section class="w-full md:w-xl">
		<!-- morning -->
		{#if activeMorningShift}
			<Chart.Container config={chartConfig} class="relative mt-4">
				{#if !$shiftCountData.morning.morningShift_count}
					<span class="absolute top-[40%] animate-bounce text-xl md:left-[41%]">No data...</span>
				{/if}

				<BarChart
					labels={{ offset: 5 }}
					data={morningShiftData}
					xScale={scaleBand().padding(0.25)}
					x="time"
					series={[{ key: 'count', label: 'Produced', color: chartConfig.time.color }]}
					axis="x"
					rule={false}
					props={{
						bars: {
							stroke: 'none',
							radius: 8,
							rounded: 'all',
							motion: {
								y: { type: 'tween', duration: 500, easing: cubicInOut },
								height: { type: 'tween', duration: 500, easing: cubicInOut }
							}
						},
						highlight: { area: { fill: 'none' } },
						xAxis: { format: (d: any) => d.slice(0, 3) }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</BarChart>
			</Chart.Container>
		{/if}
		<!-- afternoon  -->
		{#if activeAfternoonShift}
			<Chart.Container config={chartConfig} class="relative mt-4">
				{#if !$shiftCountData.afternoon.afternoonShift_count}
					<span class="absolute top-[40%] animate-bounce text-xl md:left-[41%]">No data...</span>
				{/if}

				<BarChart
					labels={{ offset: 5 }}
					data={afternoonShiftData}
					xScale={scaleBand().padding(0.25)}
					x="time"
					series={[{ key: 'count', label: 'Produced', color: chartConfig.time.color }]}
					axis="x"
					rule={false}
					props={{
						bars: {
							stroke: 'none',
							radius: 8,
							rounded: 'all',
							motion: {
								y: { type: 'tween', duration: 500, easing: cubicInOut },
								height: { type: 'tween', duration: 500, easing: cubicInOut }
							}
						},
						highlight: { area: { fill: 'none' } },
						xAxis: { format: (d: any) => d.slice(0, 3) }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</BarChart>
			</Chart.Container>
		{/if}
		<!-- night  -->
		{#if activeNightShift}
			<Chart.Container config={chartConfig} class="relative mt-4">
				{#if !$shiftCountData.night.nightShift_count}
					<span class="absolute top-[40%] animate-bounce text-xl md:left-[41%]">No data...</span>
				{/if}

				<BarChart
					labels={{ offset: 5 }}
					data={nightShiftData}
					xScale={scaleBand().padding(0.25)}
					x="time"
					series={[{ key: 'count', label: 'Produced', color: chartConfig.time.color }]}
					axis="x"
					rule={false}
					props={{
						bars: {
							stroke: 'none',
							radius: 8,
							rounded: 'all',
							motion: {
								y: { type: 'tween', duration: 500, easing: cubicInOut },
								height: { type: 'tween', duration: 500, easing: cubicInOut }
							}
						},
						highlight: { area: { fill: 'none' } },
						xAxis: { format: (d: any) => d.slice(0, 3) }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</BarChart>
			</Chart.Container>
		{/if}
	</section>

	<section class="mx-auto flex w-full flex-col items-center lg:w-[200px]">
		<article class="mx-auto mt-2 w-full">
			<div class="flex justify-around gap-2 lg:flex-col">
				<h4 class="hidden text-center font-semibold tracking-widest md:block">Shift</h4>
				<Button
					variant="outline"
					size="sm"
					onclick={setMorningShift}
					class={activeMorningShift ? 'bg-my-emerald text-black' : 'bg-inherit'}
					><RadioTower
						class="text-success animate-puls {liveShift === 'morning' ? 'block' : 'hidden'}"
					/> Morning</Button
				>
				<Button
					variant="outline"
					size="sm"
					onclick={setAfternoonShift}
					class={activeAfternoonShift ? 'bg-my-emerald text-black' : 'bg-inherit'}
					><RadioTower
						class="text-success animate-pulse {liveShift === 'afternoon' ? 'block' : 'hidden'}"
					/>
					Afternoon</Button
				>
				<Button
					variant="outline"
					size="sm"
					onclick={setNightShift}
					class={activeNightShift ? 'bg-my-emerald text-black' : 'bg-inherit'}
					><RadioTower
						class="text-success animate-pulse {liveShift === 'night' ? 'block' : 'hidden'}"
					/>Night</Button
				>
			</div>
		</article>

		<!--  -->
		<article class="font-exo mt-6 w-fit text-xs md:text-xl">
			{#if activeMorningShift && $shiftCountData.morning.morningShift_count}
				<div class="flex">
					<p>
						Total - <span class="text-primary font-bold"
							>{$shiftCountData.morning.morningShift_count}</span
						>
					</p>
					<p>
						Date - <span class="text-primary font-bold"
							><Time timestamp={$shiftCountData.morning.date} format="D/M/YYYY" /></span
						>
					</p>
				</div>
			{:else if activeAfternoonShift && $shiftCountData.afternoon.afternoonShift_count}
				<div>
					<p>
						Total - <span class="text-primary font-bold"
							>{$shiftCountData.afternoon.afternoonShift_count}</span
						>
					</p>
					<p>
						Date - <span class="text-primary font-bold"
							><Time
								timestamp={$shiftCountData.afternoon.afternoonShift_count}
								format="D/M/YYYY"
							/></span
						>
					</p>
				</div>
			{:else if activeNightShift && $shiftCountData.night.nightShift_count}
				<div class="flex space-x-12 md:flex-col">
					<p>
						Total - <span class="text-primary font-bold">
							{$shiftCountData.night.nightShift_count}</span
						>
					</p>
					<p>
						Date - <span class="text-primary font-bold">
							<Time timestamp={$shiftCountData.night.date} format="D/M/YYYY" /></span
						>
					</p>
				</div>
			{/if}
		</article>
	</section>
</main>
