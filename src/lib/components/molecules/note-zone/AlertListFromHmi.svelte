<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { InfoIcon } from 'lucide-svelte';
	import { buttonVariants } from '../../ui/button/button.svelte';
	import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../ui/hover-card';
	import { cn } from '../../ui/utils';
	import { Separator } from '../../ui/separator';
	import { type Note } from '$lib/utils/types/machineTypes';

	let { alertList, DB_dataStatus } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class={cn(buttonVariants({ variant: 'outline' }))}>List IDs</Dialog.Trigger>

	<Dialog.Content class="h-[80%] min-w-[60%] overflow-auto">
		<Dialog.Header>
			<Dialog.Title class="text-2xl">Fault category</Dialog.Title>
			<Dialog.Description>
				<div class="text-muted-foreground flex flex-col items-start text-xs">
					{#each alertList as alert}
						{#if alert[0] === 1}
							<h4 class="text-warning text-lg">Hmi alert list</h4>
						{/if}
						<div class="flex gap-x-2">
							<span>{alert[0]} - {alert[1]}</span>

							{#if DB_dataStatus.data.notes.some((n: Note) => n.alertId === alert[0])}
								<HoverCard>
									<HoverCardTrigger class="my-auto flex size-4 items-center justify-center">
										<InfoIcon class="text-warning size-4" />
									</HoverCardTrigger>
									<div>
										<HoverCardContent
											class="flex w-xl flex-col gap-y-5 overflow-auto overflow-y-auto lg:max-h-[700px]"
										>
											{#each DB_dataStatus.data.notes.filter((n: any) => n.alertId.toString() === alert[0].toString()) as note}
												<div class="text-muted-foreground flex flex-col text-xs">
													<p class="flex justify-between">
														{note.createdAt.toLocaleString()} <span>#{note.id}</span>
													</p>
													<span>
														Alert Id:<span class="text-destructive font-semibold"
															>{note.alertId}</span
														>
													</span>

													<span class="mb-1">{note.user.email}</span>
													<Separator />
													<p class="text-secondary-foreground mt-1 text-xs">
														{note.alertDescription}
													</p>
												</div>
											{/each}
										</HoverCardContent>
									</div>
								</HoverCard>
							{/if}
						</div>
					{/each}
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
