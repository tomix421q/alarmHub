<script lang="ts">
	import { currentProductionData } from '$lib/stores/sseConnectStore';

	let currentProduction = $derived($currentProductionData);

	// $inspect('');
</script>

<div class="flex h-full flex-col justify-between">
	<section class="flex flex-grow flex-col gap-y-3 text-sm">
		<!--  -->
		<article class="flex">
			<p class="mr-2">Downtime Info:</p>
			{#if currentProduction.actDowntime !== null && currentProduction.actDowntime > 60}
				<span class="text-warning font-bold">
					{(currentProduction.actDowntime / 60).toFixed(1) + ' hod'}
				</span>
			{:else if currentProduction.actDowntime !== null && currentProduction.actDowntime > 0 && currentProduction.actDowntime < 60}
				<span class="text-warning font-bold">{currentProduction.actDowntime + ' min'}</span>
			{:else if currentProduction.actDowntime === 0}
				<span class="text-bold text-success">In Production</span>
			{:else}
				{' N/A'}
			{/if}
		</article>
		<!--  -->
		<article class="flex">
			<p class="mr-2">Current Production:</p>
			{#if currentProduction.prodCurrentNum !== null}
				<p class="text-success font-bold">{currentProduction.prodCurrentNum}</p>
			{:else}
				<p>N/A</p>
			{/if}
		</article>
		<!--  -->
		<article class="flex">
			<p class="mr-2">Tool Name:</p>
			{#if currentProduction.toolName !== 'N/A'}
				<p class="text-success font-bold">{currentProduction.toolName}</p>
			{:else}
				<p>{currentProduction.toolName}</p>
			{/if}
		</article>
		<!--  -->
		<article class="flex">
			<p class="mr-2">Tool Number:</p>
			{#if currentProduction.toolNumber !== null}
				<p class="text-success font-bold">{currentProduction.toolNumber}</p>
			{:else}
				<p>N/A</p>
			{/if}
		</article>
	</section>
	<div class="text-muted-foreground mt-2 text-center text-xs">
		{#if currentProduction.timeStamp !== null}
			Last update : {currentProduction.timeStamp?.toLocaleTimeString()}
		{/if}
	</div>
</div>
