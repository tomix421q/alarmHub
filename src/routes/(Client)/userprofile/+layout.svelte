<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import HeaderText from '$lib/components/molecules/HeaderText.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { userProfileUrlsConst } from '$lib/utils/constants/constants';
	import { onMount } from 'svelte';

	let { children } = $props();
	let currentPath = $state('');

	onMount(() => {
		currentPath = window.location.pathname;
	});
	afterNavigate(() => {
		currentPath = window.location.pathname;
	});


</script>

<main class="mt-8 w-full lg:w-7xl">
	<HeaderText text="User Profile" />

	<div class="mb-8 flex gap-x-4">
		{#each userProfileUrlsConst as url}
			<Button variant={currentPath === url.url ? 'outline' : 'default'} href={url.url}
				size='sm'>{url.title}</Button
			>
		{/each}
	</div>

	<section class="">
		{@render children()}
	</section>
</main>
