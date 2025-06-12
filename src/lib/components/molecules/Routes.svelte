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

<main class="space-y-2 lg:space-y-0.5">
	{#each urlsConst as url}
		<div class="group relative flex justify-center">
			<Button
				variant="ghost"
				class="{currentPath === url.url ? '!bg-secondary' : ''} {url.title === 'Home'
					? 'text-accent-foreground font-bold tracking-widest uppercase'
					: ''} !w-full"
				href={url.url}
			>
				<p class={'md:text-md font-exo max-sm:text-2xl'}>{url.title}</p>
			</Button>
		</div>
	{/each}
</main>
