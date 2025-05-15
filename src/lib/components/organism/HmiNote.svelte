<script lang="ts">
	import type {
		SuccessResponse,
		ErrorResponse,
		MachineDbType
	} from '$lib/utils/types/machineTypes.js';
	import { FunnelPlus, MinusCircle, PlusCircle, Scan, X } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import { authClient } from '$lib/auth/auth-client';
	import Separator from '../ui/separator/separator.svelte';
	import { enhance } from '$app/forms';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import { slide } from 'svelte/transition';
	import type { ActionData } from '../../../routes/(Client)/machines/[name]/$types';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { hmiNoteFilters } from '$lib/stores/filter';
	import { renderMarkdoc } from '$lib/utils/frontend';
	import { onMount, tick } from 'svelte';
	import AlertListFromHmi from '../molecules/AlertListFromHmi.svelte';
	import Checkbox from '../ui/checkbox/checkbox.svelte';

	let {
		DB_dataStatus,
		alertList,
		form
	}: {
		DB_dataStatus: SuccessResponse<MachineDbType> | ErrorResponse;
		alertList: Map<number, string>;
		form: ActionData;
	} = $props();

	const session = authClient.useSession();
	let isAddNoteOpen = $state(false);
	let isOpenFilter = $state(false);
	let noteTextInput = $state('');
	let generatedHtmlFromMd = $state();
	let renderedNotes = $state<any>([]);
	let notHmiNote = $state(false);
	let alertId = $state<number>();

	function goToPage(p: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', p.toString());
		// window.location.href = url.toString();
		goto(url.pathname + url.search, { keepFocus: true, noScroll: true, replaceState: true });
	}

	// FILTERING HMI NOTESS
	const filters = $derived(hmiNoteFilters);
	function applyFilter() {
		const params = new URLSearchParams();
		if ($filters.alertId) params.set('alertId', $filters.alertId);
		if ($filters.user) params.set('user', $filters.user);
		if ($filters.desc) params.set('desc', $filters.desc);
		if ($filters.from) params.set('from', $filters.from);
		if ($filters.to) params.set('to', $filters.to);
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
	}
	function clearFilter() {
		hmiNoteFilters.set({
			alertId: '',
			user: '',
			desc: '',
			from: '',
			to: ''
		});
		goto(page.url.pathname, { keepFocus: true, noScroll: true, replaceState: true });
	}

	async function toggleAddNote() {
		isAddNoteOpen = !isAddNoteOpen;
		if (isAddNoteOpen) {
			await tick();
			const el = document.getElementById('note-form');
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	$effect(() => {
		hmiNoteFilters.set({
			alertId: page.url.searchParams.get('alertId') ?? '',
			user: page.url.searchParams.get('user') ?? '',
			desc: page.url.searchParams.get('desc') ?? '',
			from: page.url.searchParams.get('from') ?? '',
			to: page.url.searchParams.get('to') ?? ''
		});
		onMount(() => {
			if ($filters.alertId || $filters.user || $filters.desc || $filters.from || $filters.to) {
				isOpenFilter = true;
			}
		});

		if (form?.success) {
			noteTextInput = '';
			clearFilter();
			setTimeout(() => {
				isAddNoteOpen = false;
				form = null;
				goToPage(1);
			}, 7000);
		}
		renderedNotes = DB_dataStatus.success
			? DB_dataStatus.data.notes.map((note) => ({
					...note,
					renderedHtml: renderMarkdoc(note.alertDescription)
				}))
			: [];

		if (notHmiNote) {
			alertId = 0;
		}
	});

	// $inspect(DB_dataStatus.success && DB_dataStatus);
</script>

<main class="flex flex-col gap-5">
	<div class="relative">
		<section class="mb-4 flex flex-col">
			<div class="flex w-full items-center justify-between">
				<div class="flex flex-col gap-3 md:flex-row md:items-center">
					<AlertListFromHmi {alertList} {DB_dataStatus} />
					<Button
						variant={isOpenFilter ? 'destructive' : 'outline'}
						onclick={() => {
							isOpenFilter = !isOpenFilter;
						}}
					>
						{#if isOpenFilter}
							<X />Close Filter
						{:else}
							<FunnelPlus />Filter
						{/if}
					</Button>
				</div>

				<p class="text-muted-foreground text-center text-xs">
					Last added notes <br />(Total:
					<span class="text-secondary-foreground"
						>{DB_dataStatus?.success && DB_dataStatus.totalItems}</span
					>)
				</p>
			</div>
			<div class="mt-2">
				{@render filter()}
			</div>
			{#if $session?.data?.user.email && DB_dataStatus.success && DB_dataStatus.data.name}
				<section>
					{@render addNote()}
				</section>
			{/if}
		</section>

		<section class="h-auto max-h-[1000px] overflow-y-scroll pr-2">
			<div class="flex flex-col gap-y-3">
				{@render hmiNotesList()}
				{@render pagination()}
			</div>
		</section>
	</div>
</main>

{#snippet hmiNotesList()}
	{#if DB_dataStatus.success}
		{#each renderedNotes as note}
			<article class="bg-secondary w-full rounded-lg p-2">
				<div class="text-muted-foreground mb-2 flex justify-between text-xs">
					<span>
						Alert Id: <span class="text-destructive font-bold">{note.alertId}</span>
					</span>
					<div>
						<span class="tracking-tight">
							<span>{note.createdAt.toLocaleString()} · </span>
						</span>
						<span>{note.user.name || note.user.email}</span>
					</div>
				</div>
				<Separator class="bg-black/50" />

				<div class="mt-2 w-xs text-sm tracking-tight break-words md:w-xl">
					<p class="markdoc-content">{@html note.renderedHtml}</p>
				</div>
			</article>{/each}
	{/if}
{/snippet}

{#snippet addNote()}
	<div>
		<Button
			class="my-4 w-full"
			onclick={toggleAddNote}
			variant={isAddNoteOpen ? 'destructive' : 'default'}
		>
			{#if isAddNoteOpen}
				<MinusCircle /> <span>Close note form </span>
			{:else}
				<PlusCircle /><span>Add note to alert</span>
			{/if}
		</Button>

		{#if $session?.data?.user.email && DB_dataStatus.success && DB_dataStatus.data.id}
			<form
				method="POST"
				action={'?/addnote'}
				class="w-full {isAddNoteOpen ? 'block' : 'hidden'}"
				use:enhance
				id="note-form"
			>
				<!-- VALIDATE INFO -->
				<div class="my-4 text-xs">
					{#if !form?.success}
						{#if form?.fieldErrors}
							<ul>
								{#each Object.entries(form?.fieldErrors) as [field, error] (field)}
									<li class="text-red-500">
										<strong
											class="text-warning
										">{field}:</strong
										>
										{error}
									</li>
								{/each}
							</ul>
						{/if}
						<p class="text-warning">{form?.error}</p>
					{:else}
						<p class="text-success">{form?.message}</p>
					{/if}
				</div>

				<input
					id="machineId"
					name="machineId"
					type="hidden"
					hidden
					value={DB_dataStatus.success && DB_dataStatus.data.id}
				/>
				<input type="hidden" id="user-id" name="userId" value={$session?.data?.user.id} hidden />

				<div class="my-4 flex items-center gap-x-2">
					<Label for="notHmiNote">Not hmi alert</Label>
					<Checkbox id="notHmiNote" name="notHmiNote" bind:checked={notHmiNote} />
				</div>

				<div>
					<Label for="alert-id">Hmi ID alert</Label>
					<Input
						id="alert-id"
						disabled={notHmiNote}
						name="alertId"
						type="text"
						bind:value={alertId}
						placeholder="Insert alert id"
					/>
				</div>

				<div>
					<Label for="note-text">Description</Label>
					<Textarea
						id="note-text"
						name="text"
						bind:value={noteTextInput}
						placeholder="Insert destription"
						required
						class="lg:min-h-[200px]"
					/>
				</div>

				<Button type="submit" class="mt-2 w-full">Submit</Button>
			</form>
		{/if}
	</div>
{/snippet}

{#snippet filter()}
	{#if isOpenFilter}
		<form class="bg-my-indigo text-secondary flex flex-wrap gap-3 rounded-sm p-2 text-center">
			<div class="w-[140px]">
				<Label class="text-xs font-bold">Filter by alert Id</Label>
				<Input type="text" bind:value={$filters.alertId} placeholder="ID" />
			</div>
			<div class="w-[140px]">
				<Label class="text-xs font-bold">Filter by user</Label>
				<Input type="text" bind:value={$filters.user} placeholder="User" />
			</div>
			<div class="w-[140px]">
				<Label class="text-xs font-bold">By description</Label>
				<Input type="text" bind:value={$filters.desc} placeholder="Text" />
			</div>
			<div class="flex gap-x-3">
				<div class="w-[140px]">
					<Label class="text-xs font-bold">Date from</Label>
					<Input type="date" bind:value={$filters.from} />
				</div>
				<div class="w-[140px]">
					<Label class="text-xs font-bold">Date to</Label>
					<Input type="date" bind:value={$filters.to} />
				</div>
			</div>
			<div class="flex items-end gap-x-2">
				<Button variant="destructive" size="sm" onclick={clearFilter}><X />Clear</Button>
				<Button onclick={applyFilter} type="submit" class="w-full" variant="default" size="sm"
					><Scan />Apply</Button
				>
			</div>
		</form>
	{/if}
{/snippet}

{#snippet pagination()}
	{#if DB_dataStatus.success && DB_dataStatus.totalPages! > 1}
		<nav class="mx-auto text-sm">
			<Button
				variant="ghost"
				disabled={DB_dataStatus.page! <= 1}
				onclick={() => goToPage(DB_dataStatus.page! - 1)}>Prev</Button
			>
			<span> {DB_dataStatus.page} / {DB_dataStatus.totalPages}</span>
			<Button
				variant="ghost"
				disabled={DB_dataStatus.page! >= DB_dataStatus.totalPages!}
				onclick={() => goToPage(DB_dataStatus.page! + 1)}>Next</Button
			>
		</nav>
	{/if}
{/snippet}
