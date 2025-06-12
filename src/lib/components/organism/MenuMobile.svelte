<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { MenuIcon } from '@lucide/svelte';
	import { buttonVariants } from '../ui/button/button.svelte';
	import { afterNavigate } from '$app/navigation';
	import Routes from '../molecules/Routes.svelte';
	import Separator from '../ui/separator/separator.svelte';

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

		<Sheet.Content side="left" class="w-fit p-4">
			<Sheet.Header>
				<Sheet.Title>Menu</Sheet.Title>
				<Separator />
			</Sheet.Header>
			<div class="mt-6 flex flex-col items-start justify-start gap-1">
				<Routes />
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>
