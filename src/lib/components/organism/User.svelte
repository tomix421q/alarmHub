<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Button, { buttonVariants } from '../ui/button/button.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { User, UserCheck, UserCheck2, UserCircle } from '@lucide/svelte';
	import { redirect } from '@sveltejs/kit';

	const session = authClient.useSession();
	let open = $state(false);

	function handleLogout() {
		authClient.signOut();
		goto('/', { replaceState: true });
	}

	afterNavigate(() => {
		open = false;
	});
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
		{#if $session.data?.user.email}
			<span class="hidden text-sm min-lg:block">{session.value?.data?.user.name}</span>
			<UserCircle class="!size-6 text-green-500 " />
		{:else}
			<User class="!size-6 " />
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="bg-secondary">
		<DropdownMenu.Group>
			{#if $session.data?.user.email}
				<DropdownMenu.GroupHeading>Account</DropdownMenu.GroupHeading>
				<DropdownMenu.Separator />
				<DropdownMenu.Item><a href="/userprofile">Profile</a></DropdownMenu.Item>
				<DropdownMenu.Item><a href="/userprofile/account">Account</a></DropdownMenu.Item>
				<DropdownMenu.Item><a href="/userprofile/myposts">My Posts</a></DropdownMenu.Item>
				<DropdownMenu.Item><a href="/userprofile/favorite">Favorite</a></DropdownMenu.Item>
				<DropdownMenu.Separator />
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
