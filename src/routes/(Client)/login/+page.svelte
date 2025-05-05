<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth/auth-client.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { loginSchema } from '$lib/utils/zod/auth';
	import { ExternalLinkIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	let email = $state('');
	let password = $state('');
	let errorMsg = $state<string[]>([]);
	let loading = $state(false);
	let openResendEmail = $state(false);
	let emailToVerify = $state('');

	onMount(() => {});

	async function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();
		loading = true;

		const validationResult = loginSchema.safeParse({ email, password });
		if (!validationResult.success) {
			errorMsg = validationResult.error.issues.map((issue) => issue.message);
			loading = false;
			return;
		}

		const { data, error } = await authClient.signIn.email(
			{
				email,
				password
			},
			{
				onSuccess: (ctx: any) => {
					goto('/');
				},
				onError: (ctx: any) => {
					if (ctx.error.status === 403) {
						errorMsg = ['Please verify your email'];
					}
					console.log(ctx.error);
					errorMsg = [ctx.error.message];
				}
			}
		);
		loading = false;
	}
	async function socialLogin(event: { preventDefault: () => void }) {
		event.preventDefault();
		await authClient.signIn.social({
			provider: 'google'
		});
	}
	async function sendVerificationEmail(event: { preventDefault: () => void }) {
		event.preventDefault();
		await authClient.sendVerificationEmail(
			{
				email: emailToVerify,
				callbackURL: '/login'
			},
			{
				onSuccess: (ctx: any) => {
					openResendEmail = false;
					emailToVerify = '';
					errorMsg = ['Verification email sent check email'];
				},
				onError: (ctx: any) => {
					errorMsg = [ctx.error.message];
				}
			}
		);
	}
</script>


<main
	class="flex h-screen w-full flex-col items-center justify-center bg-[url('/image2.png')] bg-cover bg-fixed bg-center bg-no-repeat absolute top-0 left-0"
>
	<h2 class="m-1 text-2xl font-semibold text-white">Login</h2>
	<!-- Login form -->
	<form
		onsubmit={handleSubmit}
		class="hover:ring-my-indigo flex flex-col rounded-xl border bg-secondary/50 p-4 shadow-2xl shadow-black backdrop-blur-xs duration-150 ease-in hover:ring-4 min-w-[320px]"
	>
		<div>
			<Label for="email">Email</Label>
			<Input
				autocomplete="email"
				type="email"
				id="email"
				bind:value={email}
				disabled={loading}
				class="focus-visible:ring-my-indigo border-my-indigo focus-visible:ring-2"
				placeholder="Your Email"
			/>
		</div>
		<div>
			<Label for="password">Password</Label>
			<Input
				autocomplete="current-password"
				type="password"
				id="password"
				bind:value={password}
				disabled={loading}
				class="focus-visible:ring-my-indigo border-my-indigo focus-visible:ring-2"
				placeholder="Your Password"
			/>
		</div>

		{#if errorMsg.length > 0}
			<div transition:slide class="mt-1 max-w-[280px]">
				{#each errorMsg as error}
					<div class="text-xs font-bold text-red-500">
						{error}
					</div>
				{/each}
			</div>
		{/if}

		<Button type="submit" disabled={loading} class="mt-6">
			{#if loading}
				Submitting...
			{:else}
				Login
			{/if}
		</Button>

		<div class="mx-auto flex max-w-[280px] flex-wrap justify-center gap-x-4 mt-6">
			<a href="/register" class="mt-1 text-center text-xs text-clip underline">Register </a>
			<a href="/" class="mt-1 text-center text-xs underline">Home</a>

			<button
				type="button"
				onclick={() => (openResendEmail = !openResendEmail)}
				class="mt-1 text-center text-xs underline">Resend verification email</button
			>
			<a href="/forget-password" class="mt-1 text-center text-xs underline">
				Forgot your password?
			</a>
		</div>
	</form>

	<!-- Resend mail form -->
	{#if openResendEmail}
		<div transition:slide class=" mt-4 min-w-[320px] rounded-xl bg-white/50 p-4 backdrop-blur-xs">
			<form onsubmit={sendVerificationEmail} class="flex flex-col gap-y-2">
				<Label for="emailToVerify">Email</Label>
				<Input
					type="email"
					id="emailToVerify"
					bind:value={emailToVerify}
					disabled={loading}
					required
					class="focus-visible:ring-my-indigo focus-visible:ring-2 "
					placeholder="Your Email"
				/>
				<Button type="submit" class="w-full">Send Verification Emails</Button>
			</form>
		</div>
	{/if}
	<Button onclick={socialLogin} variant="outline" class="mt-4"
		><ExternalLinkIcon /> Log-in with google</Button
	>
</main>
