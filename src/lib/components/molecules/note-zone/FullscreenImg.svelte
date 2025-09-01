<script lang="ts">
	import { Fullscreen } from 'lucide-svelte';
	import Button from '../../ui/button/button.svelte';
	import { ArrowLeft, ArrowRight, X } from '@lucide/svelte';
	import type { NoteImages } from '$lib/utils/types/machineTypes';

	let { image, allImages } = $props();

	let toggleFullscreen = $state(false);
	let allImageToOpen: NoteImages[] = $derived(toggleFullscreen ? allImages : []);
	let actualImageIndex = $state(0);

	$effect(() => {
		if (image && allImages.length > 0 && toggleFullscreen) {
			actualImageIndex = allImages.findIndex((img: NoteImages) => img.url === image);
		}
		if (toggleFullscreen && actualImageIndex === -1) {
			actualImageIndex = 0;
		}
		if (!toggleFullscreen) {
			allImageToOpen = [];
			actualImageIndex = 0;
		}
	});

	function changeImage(index: number) {
		if (index >= allImages.length) index = 0;
		if (index < 0) index = allImages.length - 1;
		image = allImages[index].url;
		actualImageIndex = index;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!toggleFullscreen) return;

		if (event.key === 'ArrowRight') {
			changeImage(actualImageIndex + 1);
		} else if (event.key === 'ArrowLeft') {
			changeImage(actualImageIndex - 1);
		} else if (event.key === 'Escape') {
			toggleFullscreen = false;
		}
	}

	// $inspect(allImageToOpen);
</script>

<Button
	variant="ghost"
	size="icon"
	class=" lg:group-hover:bg-muted-foreground absolute top-0 right-0 h-full w-full md:size-6 md:top-1 md:right-1"
	onclick={() => (toggleFullscreen = !toggleFullscreen)}><Fullscreen /></Button
>

<main
	class="fixed {toggleFullscreen
		? 'block'
		: 'hidden'} inset-0 z-50 flex min-h-[100vh] w-full justify-center bg-black p-2 lg:items-center lg:p-22"
>
	<div class=" w-full">
		<!-- main frame -->
		<div class="relative">
			<Button
				onclick={() => (toggleFullscreen = false)}
				class="absolute top-2 right-2 rounded-full"
				size="icon"
				variant="destructive"><X /></Button
			>

			<Button
				class="absolute top-[50%] left-2 bg-white/20 {allImageToOpen.length === 1
					? 'hidden'
					: 'block'}"
				onclick={() => changeImage(actualImageIndex - 1)}
				variant="ghost"><ArrowLeft /></Button
			>
			<div class="flex h-[50vh] w-full items-center justify-center lg:h-[80vh]">
				<img src={image} alt="fotka" class="max-h-full max-w-full object-contain" />
			</div>

			<Button
				class="absolute top-[50%] right-2 bg-white/20  {allImageToOpen.length === 1
					? 'hidden'
					: 'block'}"
				onclick={() => changeImage(actualImageIndex + 1)}
				variant="ghost"><ArrowRight /></Button
			>
		</div>

		<!-- off frames -->
		<section class="mt-4 flex w-full flex-row gap-2">
			{#each allImageToOpen as img, index}
				<button onclick={() => changeImage(index)}>
					<img
						src={img.url}
						alt="fotka"
						class="h-[60px] w-[120px] rounded-lg lg:h-[100px] lg:w-[200px] {actualImageIndex ===
						index
							? ' border-my-indigo border-4'
							: ''}"
					/>
				</button>
			{/each}
		</section>
	</div>
</main>
<svelte:window on:keydown={handleKeydown} />
