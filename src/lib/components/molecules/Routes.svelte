<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { urlsConst } from '$lib/utils/constants/routesUrl';
	import { onMount } from 'svelte';
	import Button from '../ui/button/button.svelte';

	let currentPath = $state('');

	onMount(() => {
		currentPath = window.location.pathname;
	});
	afterNavigate(() => {
		currentPath = window.location.pathname;
	});
</script>

<main class="space-y-2 lg:space-y-1">
	{#each urlsConst as url}
		<div class="group relative flex justify-center">
			<Button
				variant="sidebar"
				class="{currentPath === url.url ? '!bg-secondary' : ''} {url.title === 'Home'
					? 'bg-my-indigo tracking-wides font-bold text-primary'
					: ''} !w-full"
				href={url.url}
			>
				<p class={'md:text-md font-exo max-sm:text-md'}>{url.title}</p>
			</Button>
		</div>
	{/each}
</main>
