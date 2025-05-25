<script lang="ts">
	import type {
		ErrorResponse,
		MachineDbType,
		SuccessResponse
	} from '$lib/utils/types/machineTypes';
	import { type statusType } from '$lib/utils/types/serverTypes';
	import { Separator } from '../ui/separator';

	let {
		WSserverAlertsStatus,
		WSserverProdDataStatus,
		DB_dataStatus
	}: {
		WSserverAlertsStatus?: statusType;
		WSserverProdDataStatus?: statusType;
		DB_dataStatus: ErrorResponse | SuccessResponse<MachineDbType>;
	} = $props();
</script>

<div class="text-sm break-words">
	<!-- WS SERVER STATUS -->
	<h5 class="text-muted-foreground font-thin">WS server status</h5>
	<Separator />
	<section class="mt-2 flex flex-col">
		<div class="font-semibold">
			<h4 class="text-warning">Alerts route</h4>
			{#if WSserverAlertsStatus?.isConnected}
				<h4 class="text-success">Connected</h4>
			{:else}
				<h4 class="text-red-500">Disconnect</h4>
			{/if}
			<p class="text-muted-foreground text-xs">{WSserverAlertsStatus?.url}</p>
			<p class="text-muted-foreground text-xs">{WSserverAlertsStatus?.WSserverInfo}</p>
			<p class="text-destructive text-xs">{WSserverAlertsStatus?.WSserverError}</p>
		</div>
		<span class="my-2 text-center">···</span>
		<div class="font-semibold">
			<h4 class="text-warning">Production route</h4>
			{#if WSserverProdDataStatus?.isConnected}
				<h4 class="text-success">Connected</h4>
			{:else}
				<h4 class="text-red-500">Disconnect</h4>
			{/if}
			<p class="text-muted-foreground text-xs">{WSserverProdDataStatus?.url}</p>
			<p class="text-muted-foreground text-xs">{WSserverProdDataStatus?.WSserverInfo}</p>
			<p class="text-destructive text-xs">{WSserverProdDataStatus?.WSserverError}</p>
		</div>
	</section>

	<!-- DB STATUS -->
	<section>
		<h5 class="text-muted-foreground mt-6 font-thin">Machine DB status</h5>
		<Separator />
		<div class="mt-2">
			{#if DB_dataStatus.success}
				<h4 class="text-success font-bold">Connected</h4>
				<h4 class="text-muted-foreground text-xs">{DB_dataStatus.data.id}</h4>
				<h4 class="text-warning">
					<span class="text-muted-foreground w-fit tracking-tight">Last update: </span>
					{DB_dataStatus.data.updateAt.toLocaleString()}
				</h4>
				<h4 class="text-warning">
					<span class="text-muted-foreground">Number of notes:</span>
					{(DB_dataStatus?.success && DB_dataStatus.totalItems) || 'X'}
				</h4>
			{:else}
				<h4 class="font-bold text-red-500">Disconnect</h4>
				<h4 class="text-warning">
					{DB_dataStatus.error}
				</h4>
			{/if}
		</div>
	</section>
</div>
