<script>
	import { Github } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import { Bug } from 'lucide-svelte';
</script>

<div
	class="bg-secondary glass-effect mt-44 flex h-[150px] w-full flex-col items-center justify-center"
>
	<div class="flex flex-col items-center">
		<Button variant="link" href="https://github.com/tomix421q/alarmHub"
			><Github />Project Github</Button
		>
		<Button variant="link"
			><a href="mailto:tomas.zilka@yanfeng.com" class="flex items-center gap-x-2"><Bug />Send bug</a
			></Button
		>
	</div>
</div>
