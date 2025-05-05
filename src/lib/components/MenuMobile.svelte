<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import House from '@lucide/svelte/icons/house';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Bot, MenuIcon } from '@lucide/svelte';
	import Button, { buttonVariants } from './ui/button/button.svelte';
	import { afterNavigate } from '$app/navigation';

	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Eqc8',
			url: '/machines/eqc8',
			icon: Bot
		},
		{
			title: 'Calendar',
			url: '#',
			icon: Calendar
		},
		{
			title: 'Search',
			url: '#',
			icon: Search
		},
		{
			title: 'Settings',
			url: '#',
			icon: Settings
		}
	];

	let open = $state(false);

	function toggleSidebar(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			open = !open;
		}
	}
	function handleClick(url: string) {
		let actUrl = window.location.pathname;
		if (actUrl === url) {
			return 'bg-primary text-secondary';
		}
	}
	afterNavigate(() => {
		open = false;
	});
</script>

<div class="lg:hidden">
	<Sheet.Root bind:open>
		<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			><MenuIcon class="!size-6" /></Sheet.Trigger
		>
		<Sheet.Content side="left" class="p-4">
			<Sheet.Header>
				<Sheet.Title>Menu</Sheet.Title>
				<!-- <Sheet.Description>
				Make changes to your profile here. Click save when you're done.
			</Sheet.Description> -->
			</Sheet.Header>
			<div class="mt-6 flex flex-col items-start justify-start gap-1">
				{#each items as item}
					<Button
						variant="ghost"
						href={item.url}
						class="flex w-full justify-start {handleClick(item.url)} "
					>
						<item.icon class="!size-6" />
						<h4 class="text-xl">{item.title}</h4>
					</Button>
				{/each}
			</div>

			<!-- <Sheet.Footer>
			<Sheet.Close>Save changes</Sheet.Close>
		</Sheet.Footer> -->
		</Sheet.Content>
	</Sheet.Root>
</div>
