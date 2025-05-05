<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { BellRingIcon, Loader2Icon } from '@lucide/svelte';
	import User from '$lib/components/User.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import MenuMobile from '$lib/components/MenuMobile.svelte';
	import ThemeButton from '$lib/components/ThemeButton.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const hideHeader = ['/login', '/register', '/forget-password', '/reset-password'];
	let currentPath = $state('');
	let loading = $state(false);

	beforeNavigate(() => {
		loading = true;
	});
	afterNavigate(() => {
		currentPath = window.location.pathname;
		loading = false;
	});
</script>

<!-- ROW HEADER -->
<header
	class="{hideHeader.includes(currentPath)
		? 'hidden'
		: 'block'} z-50 flex h-[50px] w-full items-center justify-between p-1 md:px-2"
>
	<!-- LEFT -->
	<a href="/" class=" flex items-center gap-x-1 p-1 font-bold uppercase">
		<BellRingIcon class="text-primary fill-primary " />
		<span class="font-indie m-0 p-0 pt-1 text-xl font-bold tracking-wider">Alarify</span>
	</a>
	<!-- RIGHT  -->
	<section class="flex items-center">
		<MenuMobile />
		<User />
		<ThemeButton />
	</section>
</header>
<Separator />

<main class="flex flex-row">
	<!-- SIDEBAR -->
	<article class={hideHeader.includes(currentPath) ? 'hidden' : 'block'}>
		<Sidebar />
	</article>

	<!-- CONTENT -->
	<article
		class="mx-auto {hideHeader.includes(currentPath) ? 'm-0 p-0' : 'px-2 md:px-4'} flex flex-row"
	>
		{#if loading}
			<div
				class="bg-primary text-secondary absolute left-0 flex h-screen w-full flex-col items-center justify-center"
			>
				<Loader2Icon class="-mt-44 animate-spin " size={100} />
				<h4 class="ml-4 animate-pulse">Loading...</h4>
			</div>
		{:else}
			<section class="min-h-screen">
				{@render children()}
			</section>
		{/if}
	</article>
</main>
