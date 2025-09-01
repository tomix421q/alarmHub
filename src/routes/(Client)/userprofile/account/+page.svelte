<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth/auth-client';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn } from '$lib/components/ui/utils';
	import { userProfileUrlsConst } from '$lib/utils/constants/constants';
	import type { ActionResult } from '@sveltejs/kit';
	import { PersonStanding } from 'lucide-svelte';

	const session = authClient.useSession();

	const handleSubmitEnhance = () => {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success' && result.data?.message) {
				window.location.reload();
			} else if (result.type === 'failure' && result.data?.error) {
				alert(`Error: ${result.data.error}`);
			} else if (result.type === 'error') {
				alert(`Server Error: ${result.error?.message || 'Something went wrong.'}`);
			}
		};
	};

	// $inspect($session.data?.user.image);
</script>

<main>
	<h1 class="text-muted-foreground underline">{userProfileUrlsConst[1].title}</h1>

	<div class="mt-10 flex flex-col gap-10 lg:flex-row">
		<Card class="glass-effect w-fit">
			<CardHeader>
				<div>
					{#if $session.data?.user.image}
						<img src={$session.data?.user.image} alt="avatar img" class="size-24" />
					{:else}
						<p><PersonStanding /></p>
					{/if}
				</div>
				<CardDescription>
					<span class="text-primary font-bold">Email - </span>
					<span>{$session.data?.user.email}</span></CardDescription
				>

				<CardDescription
					><span class="text-primary font-bold">Is verify email - </span>
					<span>{$session.data?.user.emailVerified}</span></CardDescription
				>
				<CardDescription
					><span class="text-primary font-bold">Name - </span>
					<span>{$session.data?.user.name}</span></CardDescription
				>
				<CardDescription>
					<span class="text-primary font-bold">Created - </span>
					<span>{$session.data?.user.createdAt.toDateString()}</span></CardDescription
				>
				<CardDescription
					><span class="text-primary font-bold">User ID - </span>
					<span class="text-[11px]">{$session.data?.user.id}</span></CardDescription
				>
				<CardContent class="flex-1  space-y-4">
					<div>
						<Button href="/forget-password">Change password</Button>
					</div>
					<!-- change name -->
					<Dialog.Root>
						<Dialog.Trigger class={cn(buttonVariants({ variant: 'secondary', size: 'default' }))}
							>Change name</Dialog.Trigger
						>
						<Dialog.Content class=" w-[90%] rounded-lg">
							<form
								action={'?/changename'}
								method="POST"
								id="change-name"
								use:enhance={handleSubmitEnhance}
							>
								<div class="mb-3">
									<Label for="change-name">Insert new name</Label>
									<Input type="text" id="change-name" name="changeName" />
								</div>
								<Button type="submit" class="w-full">Change name</Button>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				</CardContent>
			</CardHeader>
		</Card>
	</div>
</main>
