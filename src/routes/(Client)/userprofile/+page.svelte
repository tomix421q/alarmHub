<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { userProfileUrlsConst } from '$lib/utils/constants/constants';

	let { data } = $props();
	let stats = $derived(data.userprofile.stats);

	// $inspect(stats);
</script>

<main>
	<h1 class="text-muted-foreground underline">{userProfileUrlsConst[0].title}</h1>

	<!-- STATS -->
	<div
		class="glass-effect mt-8 flex w-fit items-center justify-center rounded-lg border p-2 text-center"
	>
		<h3 class="mr-16 min-w-[200px] text-start text-xl font-semibold">My notes <br />Total</h3>
		<span class="text-my-emerald bg-muted-foreground min-w-[70px] rounded-md p-2 text-4xl font-bold"
			>{stats.noteAdded}</span
		>
	</div>
	<div
		class="glass-effect mt-8 flex w-fit items-center justify-center rounded-lg border p-2 text-center"
	>
		<h3 class="mr-16 min-w-[200px] text-start text-xl font-semibold">
			Favorites Post <br /> Total
		</h3>
		<span class="text-my-indigo bg-muted-foreground min-w-[70px] rounded-md p-2 text-3xl font-bold"
			>{stats.noteLiked}</span
		>
	</div>
</main>
