<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { Heart } from 'lucide-svelte';

	let {
		noteId,
		userId,
		initialIsLiked
	}: {
		noteId: number;
		userId: string;
		initialIsLiked: boolean;
	} = $props();
	let isLiked = $state(initialIsLiked);

	function handleLikeSubmit() {
		isLiked = !isLiked;

		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'failure') {
				isLiked = !isLiked;
			}
		};
	}

	// $inspect();
</script>

<main>
	<form method="POST" action="?/toggleLike" use:enhance={handleLikeSubmit}>
		<input type="number" name="noteId" value={noteId} hidden />
		<input type="text" name="userId" value={userId} hidden />
		<button
			type="submit"
			class="flex size-6 items-center justify-center"
			><Heart
				class="size-4 text-red-400 duration-400 ease-in hover:fill-red-500 {isLiked
					? 'fill-red-500'
					: ''}"
			/></button
		>
	</form>
</main>
