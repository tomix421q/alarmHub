<script lang="ts">
	import { fade } from 'svelte/transition';
	import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
	import { ArrowDownCircle, ArrowUpCircle, InfoIcon } from 'lucide-svelte';
	import { Separator } from '../ui/separator';
	import { Button } from '../ui/button';
	import type { messageAlertType } from '$lib/utils/types/serverTypes';
	import type {
		ErrorResponse,
		MachineDbType,
		SuccessResponse
	} from '$lib/utils/types/machineTypes';

	let {
		messages,
		DB_dataStatus
	}: {
		messages: messageAlertType[];
		DB_dataStatus: ErrorResponse | SuccessResponse<MachineDbType>;
	} = $props();

	let expandToggleHmi = $state(false);
</script>

<div>
	<section
		class=" overflow-auto {expandToggleHmi ? 'max-h-auto' : 'max-h-[18.75rem] md:max-h-[25rem]'}"
	>
		{#each messages as msg, index (msg.id)}
			<div
				transition:fade
				class="flex gap-x-2 px-0.5 {index % 2
					? 'bg-muted-foreground/60'
					: 'bg-muted-foreground/70'}"
			>
				<p class="flex text-xs md:w-[2.5rem]">
					ID: <span class="text-destructive font-semibold">{msg.id}</span>
				</p>
				<span class="text-xs tracking-tight text-black"
					>{msg.timeStamp.toLocaleString('sk-SK', {
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit'
					})}</span
				>
				<p class="text-xs md:text-sm">
					{msg.msg}
				</p>
				{#if DB_dataStatus.success && DB_dataStatus.data.notes.some((n) => msg.id === n.alertId.toString())}
					<HoverCard>
						<HoverCardTrigger class="my-auto flex size-4 items-center justify-center"
							><InfoIcon class="text-warning size-4" /></HoverCardTrigger
						>
						<div>
							<HoverCardContent
								class="flex w-xl flex-col  gap-y-5 overflow-auto overflow-y-auto lg:max-h-[43.75rem]"
							>
								{#each DB_dataStatus.data.notes.filter((n) => msg.id === n.alertId.toString()) as note}
									<div class="text-muted-foreground flex flex-col text-xs">
										<span>{note.createdAt.toLocaleString()}</span>
										<span
											>Alert ID:<span class="text-destructive font-semibold">{note.alertId}</span
											></span
										>
										<span class="mb-1">{note.user.email}</span>
										<Separator />
										<p class="text-secondary-foreground mt-1 text-sm">{note.alertDescription}</p>
									</div>
								{/each}
							</HoverCardContent>
						</div>
					</HoverCard>
				{/if}
			</div>
		{/each}
	</section>
	<Button
		variant="ghost"
		size="icon"
		class="absolute bottom-0 left-[45%] z-20 -mb-4 md:left-[50%] {messages.length > 21
			? 'flex'
			: 'hidden'}"
		onclick={() => {
			expandToggleHmi = !expandToggleHmi;
		}}
	>
		{#if expandToggleHmi}
			<ArrowUpCircle class=" text-muted-foreground !size-6" />
		{:else}
			<ArrowDownCircle class="text-muted-foreground !size-6" />
		{/if}
	</Button>
</div>
