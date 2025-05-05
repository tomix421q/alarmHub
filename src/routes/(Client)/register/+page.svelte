<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth/auth-client.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { ExternalLinkIcon } from '@lucide/svelte';
	let email = $state('');
	let name = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	// const session = authClient.useSession();

	async function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();
		if (password !== confirmPassword) {
			errorMsg = 'Password dont match';
			return;
		}
		loading = true;

		const { data, error } = await authClient.signUp.email(
			{
				email,
				name,
				password
			},
			{
				onSuccess: (ctx: any) => {
					goto('/');
				},
				onError: (ctx: any) => {
					if (ctx.error.status === 403) {
						errorMsg = 'Please verify your email';
					}
					errorMsg = ctx.error.message;
				}
			}
		);
		if (error) {
			if (error.message) {
				errorMsg = error.message;
			}
		}
		loading = false;
	}

	async function socialLogin(event: { preventDefault: () => void }) {
		await authClient.signIn.social({
			provider: 'google'
		});
	}
</script>

<main
	class="z-50 flex h-screen w-full flex-col items-center justify-center bg-[url('/image2.png')] bg-cover bg-fixed bg-center bg-no-repeat absolute left-0 top-0"
>
	<h2 class="m-1 text-2xl font-semibold text-white">Register</h2>
	<form
		onsubmit={handleSubmit}
		class="hover:ring-my-indigo flex flex-col rounded-xl border bg-secondary/50 p-4 backdrop-blur-2xl duration-200 ease-in hover:ring-4 min-w-[320px]"
	>
		<div>
			<Label for="name">Name</Label>
			<Input
				type="text"
				id="name"
				class="focus-visible:ring-my-indigo border-my-indigo focus-visible:ring-2 "
				bind:value={name}
				required
				placeholder="Your Name"
				disabled={loading}
			/>
		</div>
		<div>
			<Label for="email">Email</Label>
			<Input
				type="email"
				id="email"
				bind:value={email}
				required
				disabled={loading}
				placeholder="Your Email"
				class="focus-visible:ring-my-indigo focus-visible:ring-2 border-my-indigo"
			/>
		</div>
		<div>
			<Label for="password">Password</Label>
			<Input
				type="password"
				id="password"
				bind:value={password}
				required
				disabled={loading}
				placeholder="Your Password"
				class="focus-visible:ring-my-indigo focus-visible:ring-2 border-my-indigo"
			/>
		</div>
		<div>
			<Label for="passwordConfirm">Confirm Password</Label>
			<Input
				type="password"
				id="passwordConfirm"
				bind:value={confirmPassword}
				required
				disabled={loading}
				placeholder="Confirm Password"
				class="focus-visible:ring-my-indigo focus-visible:ring-2 border-my-indigo"
			/>
		</div>

		{#if errorMsg}
			<p class="text-destructive mt-1 text-sm">{errorMsg}</p>
		{/if}

		<Button type="submit" disabled={loading} class="mt-6">
			{#if loading}
				Submiting...
			{:else}
				Register
			{/if}
		</Button>
		<div class="flex justify-center gap-x-2 mt-6">
			<a href="/" class="mt-1 text-center text-xs underline">Home</a>
			<a href="/login" class="mt-1 text-center text-xs underline">Login</a>
		</div>
	</form>
	<Button onclick={socialLogin} variant="outline" class="mt-4"
		><ExternalLinkIcon /> Continue with google</Button
	>
</main>
