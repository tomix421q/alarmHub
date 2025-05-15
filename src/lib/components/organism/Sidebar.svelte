<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import Separator from '../ui/separator/separator.svelte';
	import Button from '../ui/button/button.svelte';
	import { onMount } from 'svelte';
	import { urlsConst } from '$lib/utils/constants/routesUrl';
	import { afterNavigate } from '$app/navigation';

	let isOpenSidebar = $state<boolean>();
	let currentPath = $state('');

	onMount(() => {
		const getLC = localStorage.getItem('sidebarOpen');
		if (getLC) {
			isOpenSidebar = JSON.parse(getLC);
		} else {
			isOpenSidebar = true;
		}
	});

	const handleKeydown = (event: KeyboardEvent) => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
			isOpenSidebar = !isOpenSidebar;
		}
	};

	afterNavigate(() => {
		currentPath = window.location.pathname;
	});

	$effect(() => {
		if (isOpenSidebar === true) {
			localStorage.setItem('sidebarOpen', JSON.stringify(isOpenSidebar));
		} else if (isOpenSidebar === false) {
			localStorage.setItem('sidebarOpen', JSON.stringify(isOpenSidebar));
		}
	});
</script>

<nav
	class="from-primary to-primary z-50 mt-10 ml-2 hidden w-fit flex-col gap-y-1 rounded-lg bg-gradient-to-b p-1 lg:flex"
>
	<div class="flex w-full items-center justify-between">
		<span class="text-muted font-indie ml-2 text-sm {isOpenSidebar ? 'flex' : 'hidden'}"
			>ctrl + b</span
		>
		<Button
			onclick={() => (isOpenSidebar = !isOpenSidebar)}
			variant="ghost"
			size="icon"
			class="self-end"
		>
			{#if isOpenSidebar}
				<ArrowRight class="text-muted-foreground !size-4 rotate-180" />
			{:else}
				<ArrowRight class="text-muted-foreground !size-4 w-full" />
			{/if}
		</Button>
	</div>

	<Separator class="bg-muted h-0.5 rounded-full" />
	<!--  -->
	<!-- MENU -->
	{#each urlsConst as url}
		<div class="group relative flex w-full justify-start">
			<Button
				variant="ghost"
				size={!isOpenSidebar ? 'icon' : 'default'}
				class="flex w-full justify-start {currentPath === url.url ? 'bg-secondary' : ''}"
				href={url.url}
			>
				<url.icon class=" !size-4 {isOpenSidebar ? 'text-start' : 'mx-auto'}" />
				<p class={!isOpenSidebar ? 'hidden' : 'text-md font-exo min-w-[90px] '}>{url.title}</p>
			</Button>
			<span
				class={isOpenSidebar
					? 'hidden'
					: 'absolute right-[-60px] z-40 hidden rounded-lg bg-muted-foreground text-primary-foreground p-1 text-sm font-semibold group-hover:block mt-1'}
			>
				{url.title}
			</span>
		</div>
	{/each}
</nav>

<svelte:window on:keypress={handleKeydown} />
