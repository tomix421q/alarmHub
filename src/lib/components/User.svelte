<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button, { buttonVariants } from './ui/button/button.svelte';
	import { afterNavigate } from '$app/navigation';
	import { User, UserCheck, UserCheck2, UserCircle } from '@lucide/svelte';

	const session = authClient.useSession();
	let open = $state(false);

	function handleLogout() {
		authClient.signOut();
	}

	afterNavigate(() => {
		open = false;
	});
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		{#if $session.data?.user.email}
			<UserCircle class="!size-6 text-green-500 " />
		{:else}
			<User class="!size-6 " />
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class=" p-2">
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Account</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>Profile</DropdownMenu.Item>
			<DropdownMenu.Item>Billing</DropdownMenu.Item>
			<DropdownMenu.Item>Team</DropdownMenu.Item>
			<DropdownMenu.Separator />
			{#if $session.data?.user.email}
				<DropdownMenu.Item>
					<Button variant="destructive" size="sm" onclick={handleLogout} class="w-full"
						>Logout</Button
					>
				</DropdownMenu.Item>
			{:else}
				<div class="mt-2 space-y-3">
					<Button variant="default" size="sm" href="/login" class="w-full ">Login</Button>

					<Button variant="secondary" size="sm" href="/register" class="w-full">Register</Button>
				</div>
			{/if}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
