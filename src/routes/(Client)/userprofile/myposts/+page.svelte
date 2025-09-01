<script lang="ts">
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth/auth-client.js';
	import FullscreenImg from '$lib/components/molecules/note-zone/FullscreenImg.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';

	import Card from '$lib/components/ui/card/card.svelte';
	import { userProfileUrlsConst } from '$lib/utils/constants/constants';
	import { AlertCircle, Check, Trash, X } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let { form, data } = $props();

	const session = authClient.useSession();
	let confirm = $state<number>();
	let userPosts = $derived(data.myposts);

	$effect(() => {
		if (form?.success) {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
			setTimeout(() => {
				form = null;
				confirm = undefined;
			}, 4000);
		}
	});

	// $inspect(userPosts);
</script>

<main>
	<h1 class="text-muted-foreground underline">
		{userProfileUrlsConst[2].title}
	</h1>
	<span class="text-muted-foreground text-xs">My last 30 added notes</span>

	{#if form?.message || form?.error}
		<Alert.Root alert class="border-2-bg-warning mt-6 flex items-center gap-2">
			<Alert.AlertTitle class=""
				><AlertCircle
					class="md:size-16 {form?.message ? 'text-success' : 'text-destructive'}"
				/></Alert.AlertTitle
			>
			<Alert.Description class="mt-2 max-sm:text-xs lg:px-6">
				<p class="text-success">{form?.message}</p>
				<p class="text-destructive">{form?.error}</p></Alert.Description
			>
		</Alert.Root>
	{/if}
	<div class="mt-10 grid gap-12 lg:grid-cols-2">
		{#if userPosts.length > 0}
			{#each userPosts as post (post.id)}
				<Card class="shadow-secondary/50 hover:shadow-secondary max-w-3xl shadow-lg">
					<CardHeader>
						<CardDescription>{post.createdAt.toDateString()}</CardDescription>
						<CardDescription>ID:{post.id}</CardDescription>
						<CardDescription>
							{post.machinesOfNote
								.map((item) => item.machine.name + ' - ' + item.machine.id)
								.join(', ')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<span class="text-muted-foreground text-sm"
							>Alert ID : <span class="text-warning font-bold">{post.alertId}</span>
						</span>
						<div>{post.alertDescription}</div>
					</CardContent>

					<CardFooter class="flex h-auto flex-col items-end justify-end">
						<div class="flex h-min w-full space-x-4 overflow-x-auto pb-2 md:min-h-[100px]">
							{#each post.images as img}
								<div class="group relative w-fit flex-shrink-0">
									<img
										src={img.url}
										alt="alert"
										class="h-[65px] w-[110px] rounded-md md:h-[100px] md:w-[170px]"
									/>
									<div>
										<FullscreenImg image={img.url} allImages={post.images} />
									</div>
								</div>
							{/each}
						</div>
						<!-- delete -->
						{#if post.userId === $session.data?.user.id}
							<div class="mt-2">
								<section class="flex items-center justify-between">
									<div class="flex justify-end gap-x-2">
										<form action="?/deleteMyNote" method="POST" use:enhance class="flex">
											<input type="hidden" name="noteId" value={post.id} />
											<Button
												size="icon"
												variant="ghost"
												onclick={() => {
													if (confirm! > 0) {
														confirm = undefined;
													} else {
														confirm = post.id;
													}
												}}
												class="text-destructive size-8"
											>
												{#if confirm && confirm === post.id}
													<X />
												{:else}
													<Trash />
												{/if}</Button
											>
											{#if confirm && confirm === post.id}
												<div class="flex items-center px-2 text-xs">
													<Button size="sm" variant="destructive" type="submit"
														><Check />Confirm delete</Button
													>
												</div>
											{/if}
										</form>
									</div>
								</section>
							</div>
						{/if}
					</CardFooter>
				</Card>
			{/each}
		{:else}
			<h2 class="text-muted-foreground mt-56 flex w-full items-center justify-center">Empty</h2>
		{/if}
	</div>
</main>
