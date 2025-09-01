<script lang="ts">
	import type {
		SuccessResponse,
		ErrorResponse,
		MachineDbType,
		Note
	} from '$lib/utils/types/machineTypes.js';
	import { Check, Pencil, PersonStanding, Scan, Trash, X } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import { authClient } from '$lib/auth/auth-client';
	import Separator from '../ui/separator/separator.svelte';
	import { enhance } from '$app/forms';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';
	import type { ActionData } from '../../../routes/(Client)/machines/eqc-mf/[name]/$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { hmiNoteFilters, noteEditData } from '$lib/stores/filter';
	import { goToPage, renderMarkdoc } from '$lib/utils/frontend';
	import { onMount } from 'svelte';
	import AlertListFromHmi from '../molecules/note-zone/AlertListFromHmi.svelte';
	import { FunnelPlus, TimerIcon } from 'lucide-svelte';
	import Time from 'svelte-time/Time.svelte';
	import AddNote from '../molecules/note-zone/AddNote.svelte';
	import FullscreenImg from '../molecules/note-zone/FullscreenImg.svelte';
	import Heart from '../molecules/note-zone/Heart.svelte';

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
	let isOpenFilter = $state(false);
	let renderedNotes = $state<Note[]>([]);
	let confirm = $state<number>();

	// IS LIKED ?
	function isNoteLikedByCurrentUser(note: Note): boolean {
		if (!$session.data?.user?.id) {
			return false;
		}

		return note.likes.some((like) => like.userId === $session.data?.user.id);
	}

	// FILTERING HMI NOTESS
	const filters = $derived(hmiNoteFilters);

	function applyFilter() {
		const params = new URLSearchParams();
		if ($filters.noteId) params.set('noteId', $filters.noteId);
		if ($filters.alertId) params.set('alertId', $filters.alertId);
		if ($filters.user) params.set('user', $filters.user);
		if ($filters.desc) params.set('desc', $filters.desc);
		if ($filters.from) params.set('from', $filters.from);
		if ($filters.to) params.set('to', $filters.to);
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
	}
	function clearFilter() {
		hmiNoteFilters.set({
			noteId: '',
			alertId: '',
			user: '',
			desc: '',
			from: '',
			to: ''
		});
		goto(page.url.pathname, { keepFocus: true, noScroll: true, replaceState: true });
	}
	// CLICK ON EDIT
	function startEditingNote(note: Note) {
		noteEditData.set(note);
	}

	$effect(() => {
		hmiNoteFilters.set({
			noteId: page.url.searchParams.get('noteId') ?? '',
			alertId: page.url.searchParams.get('alertId') ?? '',
			user: page.url.searchParams.get('user') ?? '',
			desc: page.url.searchParams.get('desc') ?? '',
			from: page.url.searchParams.get('from') ?? '',
			to: page.url.searchParams.get('to') ?? ''
		});

		if (form?.success) {
			confirm = undefined;
		}

		renderedNotes = DB_dataStatus.success
			? DB_dataStatus.data.notes.map((note) => ({
					...note,
					renderedHtml: renderMarkdoc(note.alertDescription)
				}))
			: [];
	});

	onMount(() => {
		if ($filters.alertId || $filters.user || $filters.desc || $filters.from || $filters.to) {
			isOpenFilter = true;
		}
		goToPage(1);
	});

	// $inspect(isLikedByUser);
</script>

<main class="flex flex-col gap-5">
	<div class="relative">
		<section class="mb-4 flex flex-col">
			<div class="flex w-full items-center justify-between">
				<div class="flex flex-col gap-3 md:flex-row md:items-center">
					<AlertListFromHmi {alertList} {DB_dataStatus} />
					<Button
						class={$filters.noteId ||
						$filters.alertId ||
						$filters.user ||
						$filters.desc ||
						$filters.from ||
						$filters.to
							? 'bg-warning'
							: ''}
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
			{#if DB_dataStatus.success && DB_dataStatus.data.name}
				<section>
					<!-- ADD NOTE COMPONENT -->
					<AddNote {DB_dataStatus} {form} {alertList} />
				</section>
			{/if}
		</section>

		<section class="mt-8 h-auto max-h-[1000px] overflow-y-scroll pr-2">
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
					<div class="max-sm:group flex items-center gap-x-2">
						<span>
							Category ID: <span class="font-semibold text-red-500">{note.alertId}</span>
						</span>

						<span class="text-warning hidden text-[11px] group-focus:inline-block lg:inline-block"
							>{note.alertCategory}</span
						>
					</div>
					<div class="flex gap-x-4">
						<span class="tracking-tight">
							<span class="flex">
								<TimerIcon size={15} />
								<Time timestamp={note.updateAt} format="D/M/YYYY·HH:mm" />
							</span>
						</span>
						<span class="flex items-center"
							><PersonStanding size={15} />{note.user.name || note.user.email}</span
						>
					</div>
				</div>

				<div class="mt-2 w-xs text-sm tracking-tight break-words md:w-full">
					<p class="markdoc-content">{@html note.renderedHtml}</p>
					<!--  -->
					<!-- PHOTOS -->
					<div>
						<ul class="mb-6 flex flex-wrap gap-2">
							{#each note.images as image}
								<li
									class="group relative h-15 w-25 overflow-hidden rounded-md shadow-2xl md:h-25 md:w-40"
								>
									<div class="">
										<!-- gallery -->
										<FullscreenImg image={image.url} allImages={note.images} />
									</div>

									<img src={image.url} alt="note img" />
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<Separator class="mb-1 bg-gray-500/30" />
				<!--  -->
				<!-- DELETE BY OWNER USER + LIKE FOR LOGGED USER-->
				<div class="flex justify-between">
					{#if note.user.email === $session.data?.user.email}
						<section class="flex items-center justify-between">
							<div class="flex gap-x-2">
								<form action="?/deletenote" method="POST" use:enhance class="flex">
									<input type="hidden" name="noteId" value={note.id} />
									<Button
										size="icon"
										variant="ghost"
										onclick={() => {
											if (confirm! > 0) {
												confirm = undefined;
											} else {
												confirm = note.id;
											}
										}}
										class="text-destructive size-8"
									>
										{#if confirm && confirm === note.id}
											<X />
										{:else}
											<Trash />
										{/if}</Button
									>
									{#if confirm && confirm === note.id}
										<div class="flex items-center px-2 text-xs">
											<Button size="sm" variant="destructive" type="submit"
												><Check />Confirm delete</Button
											>
										</div>
									{/if}
								</form>

								<Button
									onclick={() => startEditingNote(note)}
									size="icon"
									variant="ghost"
									class="text-warning size-8"><Pencil /></Button
								>
							</div>
						</section>
					{/if}
					{#if $session.data?.user.email}
						<div class="flex items-center gap-x-2">
							{#if note && typeof note.id === 'number' && note.id > 0}
								<Heart
									noteId={note.id}
									userId={$session.data?.user?.id}
									initialIsLiked={isNoteLikedByCurrentUser(note)}
								/>
							{/if}
							<p class="text-muted-foreground text-xs">#{note.id}</p>
						</div>
					{/if}
				</div>
			</article>{/each}
	{/if}
{/snippet}

{#snippet filter()}
	{#if isOpenFilter}
		<form class="bg-muted flex flex-col flex-wrap gap-3 rounded-lg p-2">
			<section class="flex w-full flex-row gap-6 max-lg:flex-wrap">
				<div class="w-[140px]">
					<Label class="text-xs font-bold">Note ID</Label>
					<Input type="text" bind:value={$filters.noteId} placeholder="Id" />
				</div>
				<div class="w-[140px]">
					<Label class="text-xs font-bold">Alert/Category ID</Label>
					<Input type="text" bind:value={$filters.alertId} placeholder="Id" />
				</div>
				<div class="w-[140px]">
					<Label class="text-xs font-bold">User</Label>
					<Input type="text" bind:value={$filters.user} placeholder="User" />
				</div>
				<div class="w-[140px]">
					<Label class="text-xs font-bold">Description</Label>
					<Input type="text" bind:value={$filters.desc} placeholder="Text" />
				</div>
				<div class="flex justify-between gap-x-3 max-sm:w-full">
					<div class="w-[145px]">
						<Label class="text-xs font-bold">Date from</Label>
						<Input type="date" bind:value={$filters.from} />
					</div>
					<div class="w-[145px]">
						<Label class="text-xs font-bold">Date to</Label>
						<Input type="date" bind:value={$filters.to} />
					</div>
				</div>
			</section>

			<div class="mt-4 flex w-full justify-between gap-x-2">
				<Button variant="destructive" size="sm" onclick={clearFilter} class="w-[40%]"
					><X />Clear</Button
				>
				<Button onclick={applyFilter} type="submit" size="sm" class="bg-success w-[40%]"
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
