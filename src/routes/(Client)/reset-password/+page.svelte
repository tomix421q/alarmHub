<script lang="ts">
  import { authClient } from '$lib/auth/auth-client'
  import Button from '$lib/components/ui/button/button.svelte'
  import Input from '$lib/components/ui/input/input.svelte'
  import Label from '$lib/components/ui/label/label.svelte'
  import { onMount } from 'svelte'

  let newPassword = $state('')
  let confirmPassword = $state('')
  let errorMsg = $state('')
  let loading = $state(false)
  let token = $state('')

  onMount(() => {
    const urlParams = new URL(window.location.href).searchParams
    if (urlParams.has('token')) {
      token = urlParams.get('token') as string
      console.log(token)
    }
  })

  async function handleReset(event: { preventDefault: () => void }) {
    event.preventDefault()
    loading = true

    if (newPassword !== confirmPassword) {
      errorMsg = 'Passwords do not match'
      loading = false
      return
    }
    const { data, error } = await authClient.resetPassword(
      {
        newPassword: newPassword,
        token,
      },
      {
        onSuccess: (ctx: any) => {
          if (ctx.data) {
            errorMsg = 'Password reset successfully redirecting to login...'
            newPassword = ''
            confirmPassword = ''
            setTimeout(() => {
              window.location.href = '/login'
            }, 2000)
          }
        },
        onError: (ctx: any) => {
          if (ctx.error.status === 403) {
            errorMsg = 'Invalid token'
          }
          errorMsg = ctx.error.message
        },
      }
    )
    loading = false
  }
</script>

<div
  class="flex h-screen w-full flex-col items-center justify-center bg-[url('/image2.png')] bg-cover bg-fixed bg-center bg-no-repeat absolute top-0 left-0"
>
  <h2 class="text-2xl text-center md:text-2xl m-1 text-white font-semibold">Reset Your Password</h2>

  <form
    class="border md:min-w-[320px] p-4 rounded-lg flex flex-col bg-white/70 hover:ring-black/70 hover:ring-4 duration-200 ease-in gap-y-2 backdrop-blur-xs"
    onsubmit={handleReset}
  >
    <div class="grid gap-2">
      <Label for="new-password">New Password</Label>
      <Input id="new-password" type="password" placeholder="Enter new password" required bind:value={newPassword} />
    </div>
    <div class="grid gap-2">
      <Label for="confirm-password">Confirm Password</Label>
      <Input id="confirm-password" type="password" placeholder="Confirm your password" required bind:value={confirmPassword} />
    </div>
    {#if errorMsg}
      <p class="text-xs text-red-500 max-w-[220px] md:max-w-[320px] mx-auto">{errorMsg}</p>
    {/if}
    <Button type="submit" disabled={loading} class="mt-4">
      {#if loading}
        Submitting...
      {:else}
        Change password
      {/if}
    </Button>
    <div class="flex justify-center gap-x-2">
      <a href="/" class="text-xs underline text-center mt-1">Home</a>
      <a href="/register" class="text-xs underline text-center mt-1">Register </a>
    </div>
  </form>
</div>

<style>
  /* Môžete pridať vlastné štýly */
</style>
