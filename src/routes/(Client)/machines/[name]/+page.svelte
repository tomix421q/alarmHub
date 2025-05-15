<script lang="ts">
	import Header from '$lib/components/molecules/HeaderText.svelte';
	import { checkExpiredMessages, renderMarkdoc } from '$lib/utils/frontend';
	import { ArrowDownCircle, ArrowUpCircle, InfoIcon, LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { messageAlertType, statusType } from '$lib/utils/types/serverTypes.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		type ErrorResponse,
		type MachineDbType,
		type SuccessResponse
	} from '$lib/utils/types/machineTypes.js';
	import type { PageProps } from './$types.js';
	import { HoverCard, HoverCardTrigger } from '$lib/components/ui/hover-card/index.js';
	import HoverCardContent from '$lib/components/ui/hover-card/hover-card-content.svelte';
	import { authClient } from '$lib/auth/auth-client.js';
	import HmiNote from '$lib/components/organism/HmiNote.svelte';

	let { data, form }: PageProps = $props();

	const MACHINENAME = data.MACHINENAME;
	const session = authClient.useSession();
	let eventSource: EventSource;

	let loading = $state(false);
	let messages = $state<messageAlertType[]>([]);
	let WSserverClientStatus = $state<statusType>();
	let DB_dataStatus = $derived<ErrorResponse | SuccessResponse<MachineDbType>>(data.dbdata);
	let alertList = $derived(data.machineAlertsListMap);

	//FEATURES
	let expandToggleHmi = $state(false);

	setInterval(() => {
		// DELETE OLD MESSAGES [check every 5 sec.]
		checkExpiredMessages({ messages });
	}, 4000);

	// CONNECT TO SERVER SOCKET
	function connect() {
		loading = true;
		eventSource = new EventSource(`/api/streams/${MACHINENAME}`);

		eventSource.onopen = () => {
			console.log('SSE connection opened');
		};

		eventSource.onmessage = (event) => {
			let parseData = JSON.parse(event.data);
			WSserverClientStatus = parseData.status;
			if (parseData.msg) {
				loading = false;
				let parseDataAlerts: messageAlertType = JSON.parse(parseData.msg);
				const newMsg: messageAlertType = {
					id: parseDataAlerts.id,
					msg: parseDataAlerts.msg,
					timeStamp: new Date(parseDataAlerts.timeStamp)
				};
				// CHECK SAME FAULT/WARNING UPDATE TIMESTAMP
				if (messages.some((m) => m.id === newMsg.id)) {
					messages = messages.map((m) =>
						m.id === newMsg.id ? { ...m, timeStamp: newMsg.timeStamp } : m
					);
				} else {
					messages = [...messages, newMsg];
				}
			}
		};

		eventSource.onerror = () => {
			console.error('SSE connection error');
			eventSource.close();
			setTimeout(connect, 3000);
		};
	}
	onMount(() => {
		connect();
		return () => {
			if (eventSource) eventSource.close();
		};
	});

	$inspect(form);
</script>

<main class="mt-6 flex max-w-7xl flex-wrap justify-center gap-6 md:mt-12 lg:justify-between">
	<!-- HMI -->
	<article
		class=" relative flex min-h-[300px] w-full flex-col rounded-lg border p-3 shadow-2xl lg:w-[920px]"
	>
		<Header text="Hmi Live Alerts" classNameh1="!w-fit" />
		{#if loading}
			<span
				class="bg-muted-foreground text-primary flex !min-h-[250px] animate-pulse flex-col items-center justify-center text-lg font-semibold uppercase md:text-2xl"
				>Loading data from hmi... <LoaderCircle
					class="text-destructive size-12 animate-spin"
				/></span
			>
		{:else}
			<div
				class=" overflow-auto {expandToggleHmi ? 'max-h-auto' : 'max-h-[300px] md:max-h-[400px]'}"
			>
				{@render hmi()}
			</div>
			<Button
				variant="ghost"
				size="icon"
				class="absolute bottom-0 left-[45%] z-20 -mb-4 md:left-[50%] {messages.length > 21
					? 'flex'
					: 'hidden'}"
				onclick={() => {
					expandToggleHmi = !expandToggleHmi;
				}}
			>
				{#if expandToggleHmi}
					<ArrowUpCircle class=" text-muted-foreground !size-6" />
				{:else}
					<ArrowDownCircle class="text-muted-foreground !size-6" />
				{/if}
			</Button>
		{/if}
	</article>

	<!-- STATE ZONE -->
	<article class="flex max-h-[600px] w-full flex-col rounded-lg border p-3 shadow-2xl md:w-xs">
		<Header text="State {WSserverClientStatus?.name}" classNameh1="!text-2xl" />
		<div class="text-sm">
			<!-- WS SERVER STATUS -->
			<h5 class="text-muted-foreground font-thin">WS server status</h5>
			<Separator />
			<div class="mt-2">
				<div class="font-bold">
					{#if WSserverClientStatus?.isConnected}
						<h4 class="text-success">Connected</h4>
					{:else}
						<h4 class="text-red-500">Disconnect</h4>
					{/if}
				</div>
				<h4 class="text-muted-foreground">{WSserverClientStatus?.name}</h4>
				<h4 class="text-muted-foreground">{WSserverClientStatus?.url}</h4>

				<h4 class="text-warning">
					{WSserverClientStatus?.WSserverInfo}
				</h4>
				<h4 class="text-destructive">{WSserverClientStatus?.WSserverError}</h4>
			</div>
			<!-- DB STATUS -->
			<h5 class="text-muted-foreground mt-10 font-thin">Machine DB status</h5>
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
		</div>
	</article>

	<!-- NOTE ZONE -->
	<article class="flex w-full flex-col rounded-lg border p-3 shadow-2xl lg:w-3xl">
		<div class="flex items-center justify-between">
			<Header text="Fault note" />
		</div>
		{#if DB_dataStatus.success}
			<HmiNote {DB_dataStatus} {form} {alertList} />
		{/if}
	</article>
</main>

{#snippet hmi()}
	{#each messages as msg, index (msg.id)}
		<div
			transition:fade
			class="flex gap-x-2 px-0.5 {index % 2 ? 'bg-muted-foreground/60' : 'bg-muted-foreground/70'}"
		>
			<p class="flex text-xs md:w-[40px]">
				ID: <span class="text-destructive font-semibold">{msg.id}</span>
			</p>
			<span class="text-xs tracking-tight text-black"
				>{msg.timeStamp.toLocaleString('sk-SK', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})}</span
			>
			<p class="text-xs md:text-sm">
				{msg.msg}
			</p>
			{#if DB_dataStatus.success && DB_dataStatus.data.notes.some((n) => msg.id === n.alertId.toString())}
				<HoverCard>
					<HoverCardTrigger class="my-auto flex size-4 items-center justify-center"
						><InfoIcon class="text-warning size-4" /></HoverCardTrigger
					>
					<div>
						<HoverCardContent
							class="flex w-xl flex-col  gap-y-5 overflow-auto overflow-y-auto lg:max-h-[700px]"
						>
							{#each DB_dataStatus.data.notes.filter((n) => msg.id === n.alertId.toString()) as note}
								<div class="text-muted-foreground flex flex-col text-xs">
									<span>{note.createdAt.toLocaleString()}</span>
									<span
										>Alert ID:<span class="text-destructive font-semibold">{note.alertId}</span
										></span
									>
									<span class="mb-1">{note.user.email}</span>
									<Separator />
									<p class="text-secondary-foreground mt-1 text-sm">{note.alertDescription}</p>
								</div>
							{/each}
						</HoverCardContent>
					</div>
				</HoverCard>
			{/if}
		</div>
	{/each}
{/snippet}
