<script lang="ts">
	import Header from '$lib/components/molecules/HeaderText.svelte';
</script>

<main>
	<article
		class="mx-auto grid max-w-7xl items-center justify-center md:mt-16 lg:-mt-28 lg:min-h-screen lg:grid-cols-2"
	>
		<section>
			<Header
				text="Faultify"
				animateReloadSec={20}
				classNameh1={'my-12 !text-3xl text-2xl md:!text-6xl'}
			/>

			<p class="text-sm max-sm:w-sm md:text-2xl md:leading-10">
				Real-Time Machine Monitoring & Fault Management Centralize HMI data, track performance, and
				document faults with precision. Your single source of truth for operational excellence.
			</p>
		</section>

		<div>
			<img
				src="/hero.png"
				alt="landing"
				class="animate-wiggle h-auto w-full md:mx-auto md:size-[300px] lg:size-[600px]"
			/>
		</div>
	</article>
	<span class="font-indie flex w-full justify-center text-lg tracking-widest max-sm:mt-44">
		The<span class="mx-2 font-bold text-yellow-500">Smart Way</span> to Manage Faults...
	</span>
</main>
