<script lang="ts">
  import { page } from '$app/state'
</script>

<main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center">
  <div class="flex gap-5">
    <div>{page.status} error</div>
    <h1>{page.error?.message}</h1>
  </div>

  <p>
    Sorry, {page.status === 404
      ? 'We couldnt find the page you are looking for'
      : 'the page you were looking for encountered an error'}
  </p>
  <div>
    <a href="/">
      Go back home <span aria-hidden="true">&rarr;</span>
    </a>
  </div>
</main>
