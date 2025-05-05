<script lang="ts">
	import { slide } from 'svelte/transition';
	import Button from './ui/button/button.svelte';
	import { Moon, Sun } from '@lucide/svelte';
	import { theme } from '$lib/stores/theme';
</script>

<Button variant="ghost" size="icon" onclick={() => theme.toggle()}>
	{#if $theme === 'light'}
		<div transition:slide={{ axis: 'x', duration: 200 }}>
			<Moon class="size-6!  fill-sky-500/20 text-sky-500" />
		</div>
	{:else}
		<div transition:slide={{ axis: 'x', duration: 200 }}>
			<Sun class="size-6! fill-yellow-500/50 text-yellow-300" />
		</div>
	{/if}
</Button>
