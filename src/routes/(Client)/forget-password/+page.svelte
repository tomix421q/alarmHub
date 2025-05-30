<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';


	let email = $state('');
	let infoAlert = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	async function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();
		loading = true;

		const { data, error } = await authClient.forgetPassword(
			{
				email: email,
				redirectTo: '/reset-password'
			},
			{
				onSuccess() {
					window.location.href = '/login';
				},
				onError(ctx) {
					errorMsg = ctx.error.message + ' Please fill your email';
				}
			}
		);

		loading = false;
	}
</script>

<div
	class="flex h-screen w-full flex-col items-center justify-center bg-[url('/image2.png')] bg-cover bg-fixed bg-center bg-no-repeat absolute top-0 left-0"
>
	<h2 class="m-1 text-center text-2xl font-semibold text-white md:text-2xl">
		Please fill your email <br /> to reset password
	</h2>

	<form
		class="flex flex-col rounded-lg border bg-white/40 p-4 backdrop-blur-xs duration-200 ease-in hover:ring-4 hover:ring-black/70 lg:min-w-[300px]"
	>
		<div class="grid gap-2">
			<Label for="email">Email</Label>
			<Input id="email" type="email" placeholder="m@example.com" required bind:value={email} />
		</div>
		{#if errorMsg}
			<p class="test-xs mx-auto max-w-[220px] text-red-500 md:max-w-[320px]">{errorMsg}</p>
		{/if}
		<Button type="button" class="mt-6" onclick={handleSubmit}>Reset Password</Button>
		<a href="/login" class="mt-1 text-center text-xs underline"> Back to Sign In </a>
		<a href="/" class="mt-1 text-center text-xs underline"> Home</a>
	</form>
</div>
