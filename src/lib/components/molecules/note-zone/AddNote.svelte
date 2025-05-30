<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import type {
		ErrorResponse,
		MachineDbType,
		SuccessResponse
	} from '$lib/utils/types/machineTypes';
	import { MinusCircle, PlusCircle } from 'lucide-svelte';
	import { tick } from 'svelte';
	import type { ActionData } from '../../../../routes/(Client)/machines/[name]/$types';
	import { enhance } from '$app/forms';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Text } from '@lucide/svelte';
	import { goToPage, renderMarkdoc } from '$lib/utils/frontend';
	import { noteEditData } from '$lib/stores/filter';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';

	let {
		form,
		DB_dataStatus
	}: { form: ActionData; DB_dataStatus: SuccessResponse<MachineDbType> | ErrorResponse } = $props();

	const session = authClient.useSession();

	let isAddNoteOpen = $state(false);
	let isMdEditorOpen = $state(false);
	let isUpdateNoteActive = $state(false);
	let alertId = $state<number>();
	let radioAlertId = $state<string>('hmi');
	let notHmiNote = $state(false);
	let noteTextInput = $state('');
	let generatedHtmlFromMd = $state();

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

	// FORM EFFECT
	$effect(() => {
		if (form?.success) {
			goToPage(1);
			noteTextInput = '';
			notHmiNote = false;
			alertId = undefined;
			generatedHtmlFromMd = null;
			isMdEditorOpen = false;
			setTimeout(() => {
				isAddNoteOpen = false;
				form = null;
			}, 6000);
		}
		if (noteTextInput) {
			generatedHtmlFromMd = renderMarkdoc(noteTextInput);
		}
		if (radioAlertId && radioAlertId !== 'hmi') {
			alertId = Number(radioAlertId);
			notHmiNote = true;
		} else if (radioAlertId === 'hmi' && notHmiNote) {
			notHmiNote = false;
			alertId = undefined;
		}
	});

	// EDIT FORM EFFECT
	$effect(() => {
		if ($noteEditData) {
			if (!isAddNoteOpen && !isUpdateNoteActive) {
				isAddNoteOpen = true;
			}
			tick().then(() => {
				document
					.getElementById('note-form')
					?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			});
			noteTextInput = $noteEditData.alertDescription;
			alertId = $noteEditData.alertId;
			isUpdateNoteActive = true;
		}
		if (!isAddNoteOpen && isUpdateNoteActive) {
			noteTextInput = '';
			generatedHtmlFromMd = null;
			isMdEditorOpen = false;
			noteEditData.set(null);
			alertId = undefined;
			isUpdateNoteActive = false;
		}
	});

	$inspect(radioAlertId);
</script>

<main>
	<Button
		class="my-4 w-full"
		onclick={toggleAddNote}
		variant={isAddNoteOpen ? 'destructive' : 'default'}
	>
		{#if isAddNoteOpen}
			<MinusCircle /> <span>Close note {isUpdateNoteActive ? 'edit' : 'form'} </span>
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
				{#if !form?.data}
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
			<!-- pre description -->
			<div class="flex flex-col gap-x-2">
				<div class="my-4 flex items-center gap-x-2 {isUpdateNoteActive && 'hidden'}">
					<!-- <Checkbox id="notHmiNote" name="notHmiNote" bind:checked={notHmiNote} />
					<Label for="notHmiNote" class="">Not hmi alert</Label> -->

					<!--  -->
					<RadioGroup.Root bind:value={radioAlertId} class="mb-4 grid grid-cols-2 text-xs">
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={'hmi'} id="option-2" />
							<Label for="option-one">Specific Hmi ID <span class="text-muted">[1-999]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2001" id="option-2" />
							<Label for="option-one"
								>Mechanical Failures <span class="text-muted">[2001]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2002" id="option-3" />
							<Label for="option-one"
								>Electrical/Electronic Failures <span class="text-muted">[2002]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2003" id="option-4" />
							<Label for="option-one"
								>Pneumatic/Hydraulic Failures <span class="text-muted">[2003]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2004" id="option-5" />
							<Label for="option-one"
								>Software/Control System Errors <span class="text-muted">[2004]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2005" id="option-6" />
							<Label for="option-one"
								>Machine Setup and Operation Errors <span class="text-muted">[2005]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2006" id="option-7" />
							<Label for="option-one"
								>Material and Infeed Problems <span class="text-muted">[2006]</span></Label
							>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2007" id="option-1" />
							<Label for="option-one"
								>Robot specific problem <span class="text-muted">[2007]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2008" id="option-1" />
							<Label for="option-one"
								>Glue machine problem <span class="text-muted">[2008]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2000" id="option-1" />
							<Label for="option-one">No specify fault <span class="text-muted">[2000]</span></Label
							>
						</div>
					</RadioGroup.Root>
				</div>

				<div class="flex-1">
					<Label for="alert-id">Alert/Note ID</Label>
					<Input
						id="alert-id"
						readonly={notHmiNote || isUpdateNoteActive}
						name="alertId"
						type="text"
						bind:value={alertId}
						placeholder="Insert hmi alert id"
					/>
				</div>
				<div class={isUpdateNoteActive ? 'flex-1' : 'hidden'}>
					<Label for="note-id">Note Id</Label>
					<Input type="number" id="note-id" name="noteId" value={$noteEditData?.id} readonly />
				</div>
			</div>

			<!-- description -->
			<div class="relative">
				<Label for="note-text">Description</Label>
				<Textarea
					id="note-text"
					name="text"
					bind:value={noteTextInput}
					placeholder="Insert destription"
					required
					class="min-h-[200px]"
				/>
				{#if generatedHtmlFromMd}
					<Button
						size="icon"
						variant="ghost"
						onclick={() => (isMdEditorOpen = !isMdEditorOpen)}
						class="absolute right-4 bottom-4"
						type="button"
					>
						<Text />
					</Button>
				{/if}
			</div>
			{#if isMdEditorOpen}
				<span class="mt-3 block text-center text-sm">MD editor view</span>
				<div class="markdoc-content bg-muted border-destructive rounded-lg border p-2">
					{@html generatedHtmlFromMd}
				</div>
			{/if}
			<Button type="submit" class="mt-2 w-full"
				>{isUpdateNoteActive ? 'Save changes' : 'Create new note'}</Button
			>
		</form>
	{/if}
</main>
