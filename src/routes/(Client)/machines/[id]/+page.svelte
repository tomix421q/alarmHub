<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { checkExpiredMessages } from '$lib/utils/frontend';
	import {
		ArrowDownCircle,
		ArrowUpCircle,
		InfoIcon,
		LoaderCircle,
		MinusCircle,
		PlusCircle
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { messageAlertType, statusType } from '$lib/utils/types/serverTypes.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		type ErrorResponse,
		type MachineDbType,
		type SuccessResponse
	} from '$lib/utils/types/machineTypes.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types.js';
	import { HoverCard, HoverCardTrigger } from '$lib/components/ui/hover-card/index.js';
	import HoverCardContent from '$lib/components/ui/hover-card/hover-card-content.svelte';
	import { authClient } from '$lib/auth/auth-client.js';
	import { page } from '$app/state';

	let { data, form }: PageProps = $props();

	const MACHINENAME = data.MACHINENAME;
	const session = authClient.useSession();
	let eventSource: EventSource;

	let loading = $state(false);
	let messages = $state<messageAlertType[]>([]);
	let WSserverClientStatus = $state<statusType>();
	let DB_dataStatus = $derived<ErrorResponse | SuccessResponse<MachineDbType>>(data.dbdata);

	//FEATURES
	let expandToggleHmi = $state(false);
	let expandToggleNoteHmi = $state(false);
	let isAddNoteOpen = $state(false);

	const id = setInterval(() => {
		// DELETE OLD MESSAGES [check every 5 sec.]
		checkExpiredMessages({ messages });
	}, 3000);

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
		class=" relative flex min-h-[300px] w-full flex-col rounded-2xl border p-3 shadow-2xl lg:w-[920px]"
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
	<article class="flex max-h-[600px] w-full flex-col rounded-2xl border p-3 shadow-2xl md:w-xs">
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
						{DB_dataStatus.data.notes.length}
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
	<article
		class="flex w-full flex-col rounded-2xl border p-3 shadow-2xl lg:w-2xl {!DB_dataStatus.success &&
			'hidden'}"
	>
		<Header text="Hmi alert note" classNameh1="" />
		<div class="flex flex-col gap-5">
			<section class="relative">
				<h4 class="text-muted-foreground mb-2 text-center text-xs">
					Last added notes to alert <br />(Total:
					<span class="text-secondary-foreground"
						>{DB_dataStatus?.success && DB_dataStatus.data.notes.length}</span
					>)
				</h4>
				<div
					class="max-h-[200px] overflow-auto {!expandToggleNoteHmi
						? 'max-h-auto'
						: 'max-h-[500px] md:max-h-[800px]'}"
				>
					{#if DB_dataStatus.success}
						<div class="mx-2 flex flex-col gap-y-2">
							{#each DB_dataStatus.data.notes as note}
								<div class="w-full rounded-xl border p-2">
									<div class="mb-2 flex gap-x-2">
										<p class="text-xs">
											Alert Id: <span class="text-destructive font-bold">{note.alertId}</span>
										</p>
										<p class="text-xs">
											Created At: <span class="text-destructive font-bold"
												>{note.createdAt.toLocaleString()}</span
											>
										</p>
									</div>
									<Separator />
									<p class="mt-2 w-xl text-sm tracking-tight break-words">
										{note.alertDescription}
									</p>
								</div>
							{/each}
						</div>
						<Button
							variant="ghost"
							size="icon"
							class="absolute bottom-0 left-[47%] z-20 -mb-9 {DB_dataStatus.data.notes.length > 5
								? 'flex'
								: 'hidden'}"
							onclick={() => {
								expandToggleNoteHmi = !expandToggleNoteHmi;
							}}
						>
							{#if expandToggleNoteHmi}
								<ArrowUpCircle class=" text-muted-foreground !size-6" />
							{:else}
								<ArrowDownCircle class="text-muted-foreground !size-6" />
							{/if}
						</Button>
					{/if}
				</div>
			</section>
			{#if $session?.data?.user.email && DB_dataStatus.success && DB_dataStatus.data.name}
				<section>
					{@render addNote()}
				</section>
			{/if}
		</div>
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

{#snippet addNote()}
	<div>
		<Separator />
		<Button
			class="my-4 w-full"
			onclick={() => (isAddNoteOpen = !isAddNoteOpen)}
			variant={isAddNoteOpen ? 'destructive' : 'default'}
		>
			{#if isAddNoteOpen}
				<MinusCircle /> <span>Close note form </span>
			{:else}
				<PlusCircle /><span>Add note to alert</span>
			{/if}
		</Button>

		{#if $session?.data?.user.email}
			<form
				method="POST"
				action={'?/addnote'}
				class="w-full {isAddNoteOpen ? 'block' : 'hidden'}"
				use:enhance
			>
				<input
					id="machineName"
					name="machineName"
					type="text"
					hidden
					required
					value={DB_dataStatus.success && DB_dataStatus.data.name}
				/>

				<input
					type="text"
					id="user-id"
					name="userId"
					value={$session?.data?.user.id}
					hidden
					required
				/>
				<Label for="alert-id">Id alert</Label>
				<Input id="alert-id" name="alertId" type="text" placeholder="Insert alert id" />

				<Label for="note-text">Description</Label>
				<Textarea id="note-text" name="text" placeholder="Insert destription" required />

				<Button type="submit" class="mt-2 w-full">Submit</Button>
			</form>
		{/if}
	</div>
{/snippet}
