<script lang="ts">
	import FullscreenImg from '$lib/components/molecules/note-zone/FullscreenImg.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader
	} from '$lib/components/ui/card/index.js';
	import { userProfileUrlsConst } from '$lib/utils/constants/constants';

	let { data } = $props();
	let userFavorites = $derived(data.favorite);

	$inspect(userFavorites);
</script>

<main>
	<h1 class="text-muted-foreground underline">{userProfileUrlsConst[3].title}</h1>

	<span class="text-muted-foreground text-xs">My last 30 favorite notes</span>

	<div class="mt-10 grid gap-12 lg:grid-cols-2">
		{#if userFavorites.length > 0}
			{#each userFavorites as post (post.noteId)}
				<Card class="shadow-primary/20 hover:shadow-primary/50 max-w-3xl shadow-lg">
					<CardHeader>
						<CardDescription>{post.createdAt.toDateString()}</CardDescription>
						<CardDescription
							>{post.note.user.name} <span class="text-destructive">|</span>
							{post.note.user.email}</CardDescription
						>
						<CardDescription>ID:{post.note.id}</CardDescription>
						<CardDescription>{post.note.machinesOfNote.map((item) => item.machine.name + ' - ' + item.machine.id)}</CardDescription>
					</CardHeader>
					<CardContent>
						<span class="text-muted-foreground text-sm"
							>Alert ID : <span class="text-warning font-bold">{post.note.alertId}</span>
						</span>
						<div>{post.note.alertDescription}</div>
					</CardContent>

					<CardFooter class="">
						<div class="flex w-full space-x-4 overflow-x-auto pb-2">
							{#each post.note.images as img}
								<div class="group relative w-fit flex-shrink-0">
									<img
										src={img.url}
										alt="alert"
										class="h-[65px] w-[110px] rounded-md md:h-[100px] md:w-[170px]"
									/>
									<div>
										<FullscreenImg image={img.url} allImages={post.note.images} />
									</div>
								</div>
							{/each}
						</div>
					</CardFooter>
				</Card>
			{/each}
		{:else}
			<h2 class="text-muted-foreground mt-56 flex w-full items-center justify-center">Empty</h2>
		{/if}
	</div>
</main>
