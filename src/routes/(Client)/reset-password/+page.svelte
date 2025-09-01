<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { onMount } from 'svelte';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	let token = $state('');

	onMount(() => {
		const urlParams = new URL(window.location.href).searchParams;
		if (urlParams.has('token')) {
			token = urlParams.get('token') as string;
			console.log(token);
		}
	});

	async function handleReset(event: { preventDefault: () => void }) {
		event.preventDefault();
		loading = true;

		if (newPassword !== confirmPassword) {
			errorMsg = 'Passwords do not match';
			loading = false;
			return;
		}
		const { data, error } = await authClient.resetPassword(
			{
				newPassword: newPassword,
				token
			},
			{
				onSuccess: (ctx: any) => {
					if (ctx.data) {
						errorMsg = 'Password reset successfully redirecting to login...';
						newPassword = '';
						confirmPassword = '';
						setTimeout(() => {
							window.location.href = '/login';
						}, 2000);
					}
				},
				onError: (ctx: any) => {
					if (ctx.error.status === 403) {
						errorMsg = 'Invalid token';
					}
					errorMsg = ctx.error.message;
				}
			}
		);
		loading = false;
	}
</script>

<div
	class=" absolute top-0 left-0 flex h-screen w-full flex-col items-center justify-center bg-[url('/image2.png')] bg-cover bg-fixed bg-center bg-no-repeat"
>
	<h2 class="m-1 text-center text-xl font-semibold text-white md:text-2xl">Reset Your Password</h2>

	<form
		class="glass-effect flex flex-col gap-y-2 rounded-lg p-4 duration-200 ease-in md:min-w-[320px]"
		onsubmit={handleReset}
	>
		<div class="grid gap-2">
			<Label for="new-password">New Password</Label>
			<Input
				id="new-password"
				type="password"
				placeholder="Enter new password"
				required
				bind:value={newPassword}
			/>
		</div>
		<div class="grid gap-2">
			<Label for="confirm-password">Confirm Password</Label>
			<Input
				id="confirm-password"
				type="password"
				placeholder="Confirm your password"
				required
				bind:value={confirmPassword}
			/>
		</div>
		{#if errorMsg}
			<p class="text-warning mx-auto max-w-[220px] text-xs md:max-w-[320px]">{errorMsg}</p>
		{/if}
		<Button type="submit" disabled={loading} class="mt-4">
			{#if loading}
				Submitting...
			{:else}
				Change password
			{/if}
		</Button>
		<div class="flex justify-center gap-x-2">
			<a href="/" class="mt-1 text-center text-xs underline">Home</a>
			<a href="/register" class="mt-1 text-center text-xs underline">Register </a>
		</div>
	</form>
</div>

<style>
	/* Môžete pridať vlastné štýly */
</style>
