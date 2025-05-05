<script lang="ts">
	import Header from '$lib/components/Header.svelte';
</script>

<main>
	<article
		class="mx-auto grid max-w-7xl items-center justify-center lg:grid-cols-2 md:mt-24 lg:mt-32"
	>
		<section>
			<Header text="Alarify" animateReloadSec={20}  classNameh1={'my-12 !text-2xl !text-6xl'}/>

			<p class="text-lg md:text-2xl md:leading-10">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo quidem et nihil accusantium,
				soluta cumque inventore pariatur dolor porro veniam eius quas tempora ex dicta ipsam,
				distinctio tempore iusto qui.
			</p>
		</section>

		<div>
			<img src="/landing.png" alt="landing" class="mx-auto size-[300px] w-full lg:size-[600px]" />
		</div>
	</article>
</main>
