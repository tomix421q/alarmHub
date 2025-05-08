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
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { hmiNoteFilters } from '$lib/stores/filter';


	let {
		DB_dataStatus,
		form
	}: {
		DB_dataStatus: SuccessResponse<MachineDbType> | ErrorResponse;
		form: ActionData;
	} = $props();

	const session = authClient.useSession();
	let isAddNoteOpen = $state(false);
	let isOpenFilter = $state(false);

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

	$effect(() => {
		hmiNoteFilters.set({
			alertId: page.url.searchParams.get('alertId') ?? '',
			user: page.url.searchParams.get('user') ?? '',
			desc: page.url.searchParams.get('desc') ?? '',
			from: page.url.searchParams.get('from') ?? '',
			to: page.url.searchParams.get('to') ?? ''
		});
	});

	$inspect(DB_dataStatus);
</script>

<main class="flex flex-col gap-5">
	<div class="relative">
		<section class="mb-4 flex flex-col">
			<div class="flex w-full justify-between">
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
		</section>

		<section class="h-auto overflow-auto">
			<div class="flex flex-col gap-y-2">
				{@render hmiNotesList()}
				{@render pagination()}
			</div>
		</section>
	</div>
	{#if $session?.data?.user.email && DB_dataStatus.success && DB_dataStatus.data.name}
		<section>
			{@render addNote()}
		</section>
	{/if}
</main>

{#snippet hmiNotesList()}
	{#if DB_dataStatus.success}
		{#each DB_dataStatus.data.notes as note}
			<div class="w-full rounded-xl border p-2">
				<div class="text-muted-foreground mb-2 flex justify-between text-xs">
					<p class="">
						Alert Id: <span class="text-destructive font-bold">{note.alertId}</span>
					</p>
					<p class="tracking-tight">
						<span>{note.createdAt.toLocaleString()}</span>
					</p>
					<span>{note.user.name || note.user.email}</span>
				</div>
				<Separator />

				<p class="mt-2 w-xs text-sm tracking-tight break-words md:w-xl">
					{note.alertDescription}
				</p>
			</div>{/each}
	{/if}
{/snippet}

{#snippet addNote()}
	<div>
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

		{#if $session?.data?.user.email && DB_dataStatus.success && DB_dataStatus.data.name}
			<form
				method="POST"
				action={'?/addnote'}
				class="w-full {isAddNoteOpen ? 'block' : 'hidden'}"
				use:enhance
			>
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
					id="machineName"
					name="machineName"
					type="text"
					hidden
					value={DB_dataStatus.success && DB_dataStatus.data.name}
				/>

				<input type="text" id="user-id" name="userId" value={$session?.data?.user.id} hidden />
				<Label for="alert-id">Id alert</Label>
				<Input id="alert-id" name="alertId" type="text" placeholder="Insert alert id" />

				<Label for="note-text">Description</Label>
				<Textarea id="note-text" name="text" placeholder="Insert destription" required />

				<Button type="submit" class="mt-2 w-full">Submit</Button>
			</form>
		{/if}
	</div>
{/snippet}

{#snippet filter()}
	{#if isOpenFilter}
		<section
			transition:slide
			class="bg-my-indigo text-secondary flex flex-wrap gap-3 rounded-sm p-2 text-center"
		>
			<div class="w-[140px]">
				<Label class="text-xs font-bold">Filter by alert Id</Label>
				<Input type="number" bind:value={$filters.alertId} placeholder="ID" />
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
				<Button onclick={applyFilter} class="w-full" variant="default" size="sm"
					><Scan />Apply</Button
				>
			</div>
		</section>
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
