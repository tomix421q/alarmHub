<script lang="ts">
	import { onMount } from 'svelte';
	import Routes from '../molecules/Routes.svelte';

	let isOpenSidebar = $state<boolean>();

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
	<!-- <div class="flex w-full items-center justify-between">
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
	</div> -->

	<!--  -->
	<!-- MENU -->
	<Routes />
</nav>

<svelte:window on:keypress={handleKeydown} />
