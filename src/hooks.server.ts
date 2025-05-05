import { auth } from '$lib/auth/auth' // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit'
// init websocket client from server
import './lib/server/websocketClients/nodeRedClient'

export async function handle({ event, resolve }) {
  return svelteKitHandler({ event, resolve, auth })
}
