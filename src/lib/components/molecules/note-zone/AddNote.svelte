<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import type {
		ErrorResponse,
		MachineDbType,
		NoteImages,
		SuccessResponse
	} from '$lib/utils/types/machineTypes';
	import { ImagePlus, MinusCircle, PlusCircle } from 'lucide-svelte';
	import { tick } from 'svelte';
	import type { ActionData } from '../../../../routes/(Client)/machines/eqc-mf/[name]/$types';
	import { enhance } from '$app/forms';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Text, Trash } from '@lucide/svelte';
	import { goToPage, renderMarkdoc } from '$lib/utils/frontend';
	import { noteEditData } from '$lib/stores/filter';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { goto } from '$app/navigation';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { fly } from 'svelte/transition';

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
	let successAlert = $state('');

	// IMAGES
	let existingImages: NoteImages[] = $state([]);
	let newlySelectedImages: File[] = $state([]);
	let imagesToDelete: number[] = $state([]);

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
	function onNewFilesChange(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (files) {
			newlySelectedImages = [...newlySelectedImages, ...Array.from(files)];
		}
		(e.target as HTMLInputElement).value = '';
	}
	function removeNewImage(idx: number) {
		newlySelectedImages = newlySelectedImages.filter((_, i) => i !== idx);
	}
	function removeExistingImage(image: NoteImages) {
		imagesToDelete = [...imagesToDelete, image.id];
		existingImages = existingImages.filter((img) => img.id !== image.id);
	}

	const enhanceForm = () => {
		return ({ formData }: { formData: FormData }) => {
			formData.delete('noteImages');
			for (const image of newlySelectedImages) {
				formData.append('noteImages', image);
			}

			for (const id of imagesToDelete) {
				formData.append('imagesToDelete', String(id));
			}
		};
	};

	// FORM EFFECT
	$effect(() => {
		if (form?.success) {
			goToPage(1);
			noteTextInput = '';
			notHmiNote = false;
			alertId = undefined;
			generatedHtmlFromMd = null;
			isMdEditorOpen = false;
			// goto(window.location.pathname + window.location.search, {
			// 	keepFocus: true,
			// 	noScroll: true,
			// 	replaceState: true
			// });
			noteEditData.set(null);
			isAddNoteOpen = false;
			newlySelectedImages = [];
			successAlert = form?.message as string;
			setTimeout(() => {
				successAlert = '';
			}, 5000);
			form = null;
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
			existingImages = $noteEditData.images || [];
			newlySelectedImages = [];
			imagesToDelete = [];
		}
		if (!isAddNoteOpen && isUpdateNoteActive) {
			noteTextInput = '';
			generatedHtmlFromMd = null;
			isMdEditorOpen = false;
			noteEditData.set(null);
			alertId = undefined;
			isUpdateNoteActive = false;
			existingImages = [];
			newlySelectedImages = [];
			imagesToDelete = [];
		}
	});

	$inspect(form?.message);
</script>

<main>
	<p class="text-success mt-4 text-xs min-h-5">{successAlert}</p>
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
			use:enhance={enhanceForm()}
			id="note-form"
			enctype="multipart/form-data"
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
					<!-- Fault ID -->
					<RadioGroup.Root bind:value={radioAlertId} class="mb-4 grid grid-cols-2 text-xs">
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={'hmi'} id="option-1" />
							<Label for="option-1">Specific Hmi ID <span class="text-muted">[1-999]</span></Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2001" id="option-2" />
							<Label for="option-2"
								>Mechanical Failures <span class="text-muted">[2001]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2002" id="option-3" />
							<Label for="option-3"
								>Electrical/Electronic Failures <span class="text-muted">[2002]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2003" id="option-4" />
							<Label for="option-4"
								>Pneumatic/Hydraulic Failures <span class="text-muted">[2003]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2004" id="option-5" />
							<Label for="option-5"
								>Software/Control System Errors <span class="text-muted">[2004]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2005" id="option-6" />
							<Label for="option-6"
								>Machine Setup and Operation Errors <span class="text-muted">[2005]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2006" id="option-7" />
							<Label for="option-7"
								>Material and Infeed Problems <span class="text-muted">[2006]</span></Label
							>
						</div>

						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2007" id="option-8" />
							<Label for="option-8"
								>Robot specific problem <span class="text-muted">[2007]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2008" id="option-9" />
							<Label for="option-9"
								>Glue machine problem <span class="text-muted">[2008]</span></Label
							>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="2000" id="option-10" />
							<Label for="option-10">No specify fault <span class="text-muted">[2000]</span></Label>
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

			<!--  -->
			<!-- IMAGE  -->
			<div>
				<Input
					type="file"
					id="note-images"
					name="noteImages"
					accept="image/png, image/jpeg, image/gif, image/webp"
					multiple
					onchange={onNewFilesChange}
					hidden
					class="hidden"
				/>

				<Label
					for="note-images"
					class="hover:bg-secondary mt-3 flex w-full cursor-pointer justify-center rounded-lg
				p-3"
				>
					<ImagePlus class="mr-2 h-4 w-4" />
					<span
						>Add Photo <span class="text-muted-foreground text-[11px] italic"
							>· multiple allowed</span
						></span
					>
				</Label>
			</div>

			<!-- new images list -->
			{#if newlySelectedImages.length > 0}
				<div class="text-muted-foreground mt-2 mb-3 text-xs">
					<p class="text-success">Selected files ({newlySelectedImages.length})</p>
					<ul class="space-y-2">
						{#each newlySelectedImages as file, idx (file.name + file.lastModified)}
							<li class="flex text-[11px]">
								<img
									src={URL.createObjectURL(file)}
									alt={file.name}
									class="mr-4 inline-block max-h-[120] max-w-[240px]"
								/>
								<div class="flex flex-col items-center gap-x-4 md:flex-row">
									<span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
									<Button
										type="button"
										variant="destructive"
										onclick={() => removeNewImage(idx)}
										size={'icon'}><Trash /></Button
									>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- editing mode uploaded images list -->
			{#if isUpdateNoteActive && existingImages.length > 0}
				<Separator />
				<div class="text-muted-foreground mt-2 mb-3 text-xs">
					<p class="text-warning">Uploaded files ({existingImages.length})</p>
					<ul class="space-y-2">
						{#each existingImages as image (image.id)}
							<li class="flex items-center text-[11px]">
								<img
									src={image.url}
									alt="Existing note img"
									class="mr-4 inline-block max-h-[120] max-w-[240px]"
								/>
								<Button
									type="button"
									variant="destructive"
									onclick={() => removeExistingImage(image)}
									size={'icon'}><Trash /></Button
								>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<Button type="submit" class="mt-2 w-full"
				>{isUpdateNoteActive ? 'Save changes' : 'Create new note'}</Button
			>
		</form>
	{/if}
</main>
