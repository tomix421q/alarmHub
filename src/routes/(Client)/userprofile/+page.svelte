<script lang="ts">
	import { authClient } from '$lib/auth/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';

	const session = authClient.useSession();
</script>

<main>
	<div class="mt-22 flex flex-col leading-6 md:leading-12 text-sm md:text-xl">
		<div>
			{$session.data?.user.image}
		</div>
		<div>
			<span class="text-primary font-bold">Email - </span> <span>{$session.data?.user.email}</span>
		</div>
		<div>
			<span class="text-primary font-bold">Is verify email - </span>
			<span>{$session.data?.user.emailVerified}</span>
		</div>
		<div>
			<span class="text-primary font-bold">Name - </span> <span>{$session.data?.user.name}</span>
		</div>
		<div>
			<span class="text-primary font-bold">Created - </span>
			<span>{$session.data?.user.createdAt}</span>
		</div>
		<div>
			<span class="text-primary font-bold">User id - </span> <span>{$session.data?.user.id}</span>
		</div>

      <!-- change password -->
       <div>
         <Button href='/forget-password'>Change password</Button>
       </div>
	</div>
</main>
