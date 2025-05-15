<script lang="ts">
	let { text, classNameh1 = '', animateOn = true, animateReloadSec = 300 } = $props();

	let effectLine1 = $state(false);
	let effectLine2 = $state(false);

	if (animateOn) {
		setInterval(() => {
			effectLine1 = !effectLine1;
			effectLine2 = !effectLine2;
		}, animateReloadSec * 1000);
	}
</script>

<h1 class="text-my-indigo relative w-fit text-xl font-bold md:text-2xl mb-10 {classNameh1}">
	{text}
	<span class="absolute -bottom-4 left-0 flex w-full flex-col gap-1 md:-bottom-5">
		<span
			class="block h-1 rounded-4xl bg-indigo-400 md:ml-10 md:h-2 {effectLine1
				? '!h-0.5 -translate-x-1/4'
				: ''} transition-all duration-500 ease-linear"
		></span>
		<span
			class="block h-1 rounded-4xl bg-my-emerald md:mr-10 md:h-2 {effectLine2
				? '!h-0.5 translate-x-1/4'
				: ''} transition-all duration-500 ease-linear"
		></span>
	</span>
</h1>
